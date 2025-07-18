# Conway's Game of Life

**Conway's Game of Life** is a **zero-player simulation** where cells on a grid evolve over discrete time steps based on a set of simple rules. Patterns emerge, move, grow, or disappear — all determined by the state of neighboring cells.

The goal is to observe how simple rules can lead to complex and often surprising behaviors in a cellular automaton.

## Controls
- **Click** or **tap** a cell to toggle its state (alive or dead).
- **Drag** to pan the camera around the grid.
- **Scroll** with the mouse wheel or **pinch** on touch screens to **zoom** in and out.

## Rules
Each cell has **eight neighboring cells** (horizontal, vertical, and diagonal). The following rules apply to every generation:

- Any **live cell** with **fewer than two** live neighbors **dies** (underpopulation).
- Any **live cell** with **two or three** live neighbors **lives** on to the next generation (survival).
- Any **live cell** with **more than three** live neighbors **dies** (overpopulation).
- Any **dead cell** with **exactly three** live neighbors **becomes alive** (reproduction).

\
https://armcpro.github.io/game-of-life/
