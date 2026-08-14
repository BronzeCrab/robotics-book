"""Поворот на плоскости: матрица 2×2."""

import numpy as np


def rot2(theta: float) -> np.ndarray:
    """Вернуть R(θ): поворот на угол theta (радианы)."""
    c, s = np.cos(theta), np.sin(theta)
    return np.array([[c, -s], [s, c]])


if __name__ == "__main__":
    r = rot2(np.deg2rad(90))
    p = r @ np.array([1.0, 0.0])
    print(r)
    print(p)
