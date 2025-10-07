import pandas as pd

def basic_summary(df: pd.DataFrame) -> dict:
    out = {
        "shape": {"rows": int(df.shape[0]), "cols": int(df.shape[1])},
        "dtypes": {c: str(t) for c, t in df.dtypes.items()},
        "nulls": {c: int(df[c].isna().sum()) for c in df.columns},
    }
    num = df.select_dtypes(include="number")
    if not num.empty:
        out["stats"] = num.describe().to_dict()
    cat = df.select_dtypes(exclude="number")
    if not cat.empty:
        tops = {}
        for c in cat.columns:
            vc = cat[c].astype("string").value_counts(dropna=True).head(5)
            tops[c] = {str(k): int(v) for k, v in vc.items()}
        out["top_categories"] = tops
    return out

def kpi_numeric(df: pd.DataFrame, by: str | None = None, agg: str = "mean", target: str | None = None, top_n: int = 5):
    """Devuelve JSON listo para graficar (series por categoría o agregados globales)."""
    # Selección de columnas numéricas
    if target is None:
        nums = df.select_dtypes(include="number")
        cols = list(nums.columns)
        if not cols:
            return {}
    else:
        if target not in df.columns:
            raise ValueError(f"Target '{target}' no existe")
        cols = [target]

    if by:
        if by not in df.columns:
            raise ValueError(f"Columna '{by}' no existe")
        grouped = df.groupby(by, dropna=False)[cols]
        if agg == "mean":
            res = grouped.mean(numeric_only=True)
        elif agg == "sum":
            res = grouped.sum(numeric_only=True)
        elif agg == "median":
            res = grouped.median(numeric_only=True)
        else:
            raise ValueError("agg soportado: mean|sum|median")
        res = res.reset_index()
        if top_n and top_n > 0:
            res = res.head(top_n)
        return res.to_dict(orient="list")   # {col: [..], ...}
    else:
        nums = df.select_dtypes(include="number")
        if nums.empty:
            return {}
        if agg == "mean":
            s = nums.mean(numeric_only=True)
        elif agg == "sum":
            s = nums.sum(numeric_only=True)
        elif agg == "median":
            s = nums.median(numeric_only=True)
        else:
            raise ValueError("agg soportado: mean|sum|median")
        return {"columns": list(s.index), "values": [float(v) for v in s.values]}

def correlations(df: pd.DataFrame):
    num = df.select_dtypes(include="number")
    if num.empty:
        return {}
    corr = num.corr(numeric_only=True)
    return {"columns": list(corr.columns), "matrix": corr.values.tolist()}