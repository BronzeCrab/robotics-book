"""Прямая кинематика плоского 2R-манипулятора."""

import numpy as np


def fk(q: np.ndarray, l1: float, l2: float) -> np.ndarray:
    """Вернуть положение схвата (x, y) для углов q = (q1, q2)."""
    q1, q2 = q
    x = l1 * np.cos(q1) + l2 * np.cos(q1 + q2)
    y = l1 * np.sin(q1) + l2 * np.sin(q1 + q2)
    return np.array([x, y])


if __name__ == "__main__":
    pose = fk(np.array([0.6, 0.9]), l1=1.0, l2=0.8)
    print(pose)
