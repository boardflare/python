# casadi: Advanced Optimization for Excel Users

## What is casadi?

**casadi** is a Python library for symbolic and numeric optimization, automatic differentiation, and optimal control. It is designed for high-performance applications where you need to:
- Define mathematical models symbolically
- Compute exact derivatives (gradients, Jacobians, Hessians) automatically
- Solve large-scale nonlinear optimization and optimal control problems

https://web.casadi.org/docs/

While Excel’s built-in Solver is useful for simple optimization, casadi enables you to solve much more complex, nonlinear, and dynamic problems—especially when you need efficient and accurate derivatives.

## How does casadi compare to sympy?

| Feature                | casadi                                      | sympy                                 |
|------------------------|---------------------------------------------|----------------------------------------|
| Focus                  | Symbolic/numeric optimization, control      | General symbolic mathematics           |
| Automatic Differentiation | Yes (very efficient)                     | Yes (but not optimized for speed)      |
| Numeric Optimization   | Yes (interfaces to advanced solvers)        | No (mainly symbolic manipulation)      |
| Use Cases              | Optimal control, engineering, robotics      | Algebra, calculus, equation solving    |
| Performance            | High (for large-scale numeric problems)     | Moderate (for symbolic math)           |

## Example 1: Nonlinear Model Predictive Control (MPC)

Suppose you want to optimize the control of a chemical reactor. You have time-series data in Excel and want to compute the optimal control actions.

**Excel Input Table:**
| Time | State (x) | Control (u) | Setpoint |
|------|-----------|-------------|----------|
| 0    | 1.0       |             | 2.0      |
| 1    |           |             | 2.0      |
| 2    |           |             | 2.0      |

**Python/casadi workflow:**
- Read the table from Excel (e.g., with pandas)
- Define the system dynamics and cost function in casadi
- Solve for the optimal control sequence

**Excel Output Table:**
| Time | State (x) | Control (u) | Setpoint |
|------|-----------|-------------|----------|
| 0    | 1.0       | 0.8         | 2.0      |
| 1    | 1.7       | 0.6         | 2.0      |
| 2    | 2.0       | 0.0         | 2.0      |

## Example 2: Engineering Design Optimization

You want to minimize the weight of a beam subject to stress constraints. Parameters and constraints are entered in Excel.

**Excel Input Table:**
| Parameter | Value |
|-----------|-------|
| Length    | 2.0   |
| Max Stress| 100   |
| Density   | 7.8   |

**Python/casadi workflow:**
- Read parameters from Excel
- Define the weight and stress equations symbolically
- Use casadi to minimize weight subject to stress constraints

**Excel Output Table:**
| Parameter   | Optimal Value |
|-------------|--------------|
| Width       | 0.15         |
| Height      | 0.20         |
| Weight      | 4.68         |

## Example 3: Parameter Estimation for Dynamic Models

Fit a model to experimental data stored in Excel.

**Excel Input Table:**
| Time | Measured Output |
|------|-----------------|
| 0    | 1.0             |
| 1    | 1.8             |
| 2    | 2.5             |

**Python/casadi workflow:**
- Read data from Excel
- Define the model and a least-squares cost function in casadi
- Estimate parameters to best fit the data

**Excel Output Table:**
| Parameter | Estimated Value |
|-----------|----------------|
| a         | 0.95           |
| b         | 1.10           |

## Example 4: Trajectory Optimization

Plan the optimal path for a drone, with waypoints and constraints in Excel.

**Excel Input Table:**
| Waypoint | X   | Y   |
|----------|-----|-----|
| Start    | 0.0 | 0.0 |
| Mid      | 1.0 | 2.0 |
| End      | 3.0 | 3.0 |

**Python/casadi workflow:**
- Read waypoints from Excel
- Define the trajectory optimization problem in casadi
- Solve for the smoothest/fastest path

**Excel Output Table:**
| Step | X    | Y    |
|------|------|------|
| 0    | 0.0  | 0.0  |
| 1    | 0.8  | 1.5  |
| 2    | 1.7  | 2.5  |
| 3    | 3.0  | 3.0  |

## Typical Workflow for Excel Integration
1. User enters data and parameters in Excel tables.
2. A custom Excel function (e.g., via xlwings, PyXLL, or a web add-in) calls a Python script using casadi.
3. The Python script reads the Excel data, performs the optimization, and writes results back to Excel.

This approach allows Excel users to solve advanced optimization and control problems that are far beyond the capabilities of built-in Excel tools, leveraging the power of casadi behind the scenes.
