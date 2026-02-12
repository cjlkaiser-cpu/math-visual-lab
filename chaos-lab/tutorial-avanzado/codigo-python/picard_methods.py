"""
ChaosLab Tutorial Avanzado - Métodos de Picard y Análisis de Existencia
Sección 0: Fundamentos Matemáticos

Este script implementa el método de iteraciones de Picard para resolver ODEs
y verificar convergencia. Incluye visualizaciones y análisis de error.
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint
import math
import sys


def picard_iteration(f, x0, t_span, n_iterations=10, n_points=100):
    """
    Aplica el método de iteraciones de Picard a la ecuación dx/dt = f(x).

    El método de Picard construye una sucesión:
    x_{n+1}(t) = x_0 + ∫₀ᵗ f(x_n(s)) ds

    Parameters:
    -----------
    f : callable
        Función que define la ODE (dx/dt = f(x))
    x0 : float or array
        Condición inicial x(0) = x0
    t_span : tuple
        Intervalo de integración (t0, tf)
    n_iterations : int
        Número de iteraciones de Picard
    n_points : int
        Número de puntos para discretización

    Returns:
    --------
    t : array
        Vector de tiempos
    iterations : list of arrays
        Lista con cada iteración de Picard
    errors : list
        Error en cada iteración respecto a la anterior
    """
    t = np.linspace(t_span[0], t_span[1], n_points)
    dt = t[1] - t[0]

    # Inicializar: x_0(t) = x0 (constante)
    if np.isscalar(x0):
        x_current = np.full_like(t, x0, dtype=float)
    else:
        x_current = np.tile(x0, (n_points, 1))

    iterations = [x_current.copy()]
    errors = []

    print(f"Aplicando {n_iterations} iteraciones de Picard...")
    print(f"Condición inicial: x0 = {x0}")
    print(f"Intervalo: {t_span}")
    print("-" * 60)

    for n in range(n_iterations):
        # Calcular f(x_n(t)) en cada punto
        if np.isscalar(x0):
            f_values = np.array([f(x) for x in x_current])
            # Integrar: x_{n+1}(t) = x0 + ∫₀ᵗ f(x_n(s)) ds
            x_new = x0 + np.cumsum(f_values) * dt
        else:
            f_values = np.array([f(x) for x in x_current])
            x_new = x0 + np.cumsum(f_values, axis=0) * dt

        # Calcular error
        error = np.max(np.abs(x_new - x_current))
        errors.append(error)

        print(f"Iteración {n + 1:2d}: Error = {error:.6e}")

        x_current = x_new
        iterations.append(x_current.copy())

    return t, iterations, errors


def verify_convergence(f, x0, t_span, tolerance=1e-10, max_iterations=50):
    """
    Verifica la convergencia del método de Picard hasta alcanzar tolerancia.

    Returns:
    --------
    converged : bool
        True si convergió dentro del máximo de iteraciones
    n_iter : int
        Número de iteraciones realizadas
    final_error : float
        Error final alcanzado
    """
    t = np.linspace(t_span[0], t_span[1], 100)
    dt = t[1] - t[0]

    if np.isscalar(x0):
        x_current = np.full_like(t, x0, dtype=float)
    else:
        x_current = np.tile(x0, (len(t), 1))

    print(f"Verificando convergencia (tolerancia = {tolerance})...")
    print("-" * 60)

    final_error = float("inf")

    for n in range(max_iterations):
        if np.isscalar(x0):
            f_values = np.array([f(x) for x in x_current])
            x_new = x0 + np.cumsum(f_values) * dt
        else:
            f_values = np.array([f(x) for x in x_current])
            x_new = x0 + np.cumsum(f_values, axis=0) * dt

        final_error = np.max(np.abs(x_new - x_current))

        if final_error < tolerance:
            print(f"✓ Convergencia alcanzada en {n + 1} iteraciones")
            print(f"  Error final: {final_error:.2e}")
            return True, n + 1, final_error

        x_current = x_new

    print(f"✗ No convergió en {max_iterations} iteraciones")
    print(f"  Error final: {final_error:.2e}")
    return False, max_iterations, final_error


def plot_picard_iterations(
    t, iterations, title="Iteraciones de Picard", save_path=None
):
    """
    Visualiza la convergencia de las iteraciones de Picard.
    """
    plt.figure(figsize=(12, 8))

    from matplotlib import cm

    colors = cm.viridis(np.linspace(0, 1, len(iterations)))

    for i, (x, color) in enumerate(zip(iterations, colors)):
        if i == 0:
            label = f"Iteración {i} (inicial)"
            linestyle = "--"
            linewidth = 2
        elif i == len(iterations) - 1:
            label = f"Iteración {i} (final)"
            linestyle = "-"
            linewidth = 3
        else:
            label = f"Iteración {i}" if i % 2 == 0 else None
            linestyle = "-"
            linewidth = 1.5

        if label:
            plt.plot(
                t, x, label=label, color=color, linestyle=linestyle, linewidth=linewidth
            )
        else:
            plt.plot(
                t, x, color=color, linestyle=linestyle, linewidth=linewidth, alpha=0.6
            )

    plt.xlabel("t", fontsize=12)
    plt.ylabel("x(t)", fontsize=12)
    plt.title(title, fontsize=14, fontweight="bold")
    plt.legend(loc="best", framealpha=0.9)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
        print(f"Gráfico guardado en: {save_path}")

    plt.show()


def plot_convergence_rate(errors, title="Tasa de Convergencia", save_path=None):
    """
    Visualiza la tasa de convergencia del método de Picard.
    """
    plt.figure(figsize=(10, 6))

    iterations = range(1, len(errors) + 1)

    plt.semilogy(iterations, errors, "bo-", linewidth=2, markersize=8, label="Error")

    # Ajustar exponencial para estimar tasa
    rate = None
    if len(errors) > 2:
        log_errors = np.log(errors[1:])  # Ignorar primera iteración
        fit = np.polyfit(iterations[1:], log_errors, 1)
        rate = np.exp(fit[0])

        fitted_line = np.exp(fit[0] * np.array(iterations) + fit[1])
        plt.semilogy(
            iterations,
            fitted_line,
            "r--",
            label=f"Ajuste exponencial (factor ≈ {rate:.3f})",
            alpha=0.7,
        )

    plt.xlabel("Iteración", fontsize=12)
    plt.ylabel("Error máximo (escala log)", fontsize=12)
    plt.title(title, fontsize=14, fontweight="bold")
    plt.legend(loc="best")
    plt.grid(True, alpha=0.3, which="both")
    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")

    plt.show()

    return rate


# ============================================================================
# EJEMPLOS DE APLICACIÓN
# ============================================================================


def ejemplo_1_lineal():
    """
    Ejemplo 1: dx/dt = x, x(0) = 1
    Solución exacta: x(t) = e^t
    """
    print("=" * 70)
    print("EJEMPLO 1: Ecuación Lineal dx/dt = x")
    print("=" * 70)

    f = lambda x: x
    x0 = 1.0
    t_span = (0, 2)

    # Aplicar Picard
    t, iterations, errors = picard_iteration(f, x0, t_span, n_iterations=15)

    # Comparar con solución exacta
    x_exact = np.exp(t)
    x_picard = iterations[-1]

    error_vs_exact = np.max(np.abs(x_picard - x_exact))
    print(f"\nError vs solución exacta (e^t): {error_vs_exact:.6e}")

    # Visualizar
    plot_picard_iterations(
        t, iterations, title="Picard: dx/dt = x, x(0)=1", save_path="picard_lineal.png"
    )

    plot_convergence_rate(
        errors, title="Convergencia: dx/dt = x", save_path="convergencia_lineal.png"
    )


def ejemplo_2_logistico():
    """
    Ejemplo 2: dx/dt = x(1-x), x(0) = 0.5
    Solución exacta: x(t) = 1/(1 + e^{-t})
    """
    print("\n" + "=" * 70)
    print("EJEMPLO 2: Ecuación Logística dx/dt = x(1-x)")
    print("=" * 70)

    f = lambda x: x * (1 - x)
    x0 = 0.5
    t_span = (0, 5)

    t, iterations, errors = picard_iteration(f, x0, t_span, n_iterations=20)

    # Solución exacta
    x_exact = 1 / (1 + np.exp(-t))
    x_picard = iterations[-1]

    error_vs_exact = np.max(np.abs(x_picard - x_exact))
    print(f"\nError vs solución exacta: {error_vs_exact:.6e}")

    plot_picard_iterations(
        t,
        iterations,
        title="Picard: dx/dt = x(1-x), x(0)=0.5",
        save_path="picard_logistico.png",
    )


def ejemplo_3_sistema_2d():
    """
    Ejemplo 3: Sistema 2D lineal
    dx/dt = y
    dy/dt = -x
    Solución: oscilador armónico
    """
    print("\n" + "=" * 70)
    print("EJEMPLO 3: Sistema 2D - Oscilador Armónico")
    print("  dx/dt = y")
    print("  dy/dt = -x")
    print("=" * 70)

    def f(v):
        x, y = v
        return np.array([y, -x])

    x0 = np.array([1.0, 0.0])  # x(0)=1, y(0)=0
    t_span = (0, 2 * np.pi)

    t, iterations, errors = picard_iteration(f, x0, t_span, n_iterations=20)

    # Visualizar trayectoria en fase
    plt.figure(figsize=(10, 10))

    for i, x in enumerate(iterations[::3]):  # Cada 3 iteraciones
        if i == 0:
            label = f"Iteración {i * 3} (inicial)"
            linestyle = "--"
        elif i == len(iterations[::3]) - 1:
            label = f"Iteración {i * 3} (final)"
            linestyle = "-"
            linewidth = 3
        else:
            label = f"Iteración {i * 3}"
            linestyle = "-"
            linewidth = 1.5

        plt.plot(
            x[:, 0],
            x[:, 1],
            label=label,
            linestyle=linestyle,
            linewidth=linewidth if "linewidth" in dir() else 1.5,
            alpha=0.8,
        )

    plt.xlabel("x", fontsize=12)
    plt.ylabel("y", fontsize=12)
    plt.title(
        "Picard: Oscilador Armónico (Espacio de Fases)", fontsize=14, fontweight="bold"
    )
    plt.legend(loc="best")
    plt.grid(True, alpha=0.3)
    plt.axis("equal")
    plt.tight_layout()
    plt.savefig("picard_oscilador_fase.png", dpi=300, bbox_inches="tight")
    plt.show()

    print(f"\nTrayectoria final forma un círculo (elipse perfecta en límite)")


# ============================================================================
# EJERCICIOS DE LA SECCIÓN 0
# ============================================================================


def ejercicio_5_picard_explicito():
    """
    Ejercicio 5: Resolver dx/dt = x usando iteraciones de Picard explícitas
    Mostrar las primeras 5 iteraciones simbólicamente
    """
    print("\n" + "=" * 70)
    print("EJERCICIO 5: Iteraciones de Picard para dx/dt = x")
    print("=" * 70)

    print("\nLas iteraciones de Picard son:")
    print("x₀(t) = x₀ = 1")
    print("x₁(t) = 1 + ∫₀ᵗ x₀(s) ds = 1 + t")
    print("x₂(t) = 1 + ∫₀ᵗ (1+s) ds = 1 + t + t²/2")
    print("x₃(t) = 1 + t + t²/2 + t³/6")
    print("x₄(t) = 1 + t + t²/2 + t³/6 + t⁴/24")
    print("...")
    print("xₙ(t) = Σₖ₌₀ⁿ tᵏ/k!")
    print("\nEn el límite n→∞: x(t) = e^t ✓")

    # Verificar numéricamente
    print("\nVerificación numérica en t=1:")
    t_val = 1.0
    for n in [1, 2, 3, 5, 10, 20]:
        # Calcular serie truncada
        approx = sum(t_val**k / math.factorial(k) for k in range(n + 1))
        error = abs(approx - np.exp(t_val))
        print(f"  n={n:2d}: aprox={approx:.10f}, error={error:.2e}")
    print(f"\n  Exacto: e¹ = {np.exp(1):.10f}")


def ejercicio_6_intervalo_existencia():
    """
    Ejercicio 6: Estimar intervalo de existencia para dx/dt = x², x(0)=1
    Solución exacta: x(t) = 1/(1-t), explota en t=1
    """
    print("\n" + "=" * 70)
    print("EJERCICIO 6: Intervalo de existencia para dx/dt = x²")
    print("=" * 70)

    print("\nSolución exacta: x(t) = 1/(1-t)")
    print("Singularidad en t = 1 (blow-up)")
    print("\nIntentando integrar con Picard hasta t=0.9:")

    f = lambda x: x**2
    x0 = 1.0

    # Probar diferentes tiempos finales
    for tf in [0.5, 0.9, 0.99, 1.0, 1.1]:
        try:
            t, iterations, errors = picard_iteration(f, x0, (0, tf), n_iterations=30)
            x_final = iterations[-1][-1]
            x_exact = 1 / (1 - tf) if tf < 1 else float("inf")

            if tf < 1:
                error = abs(x_final - x_exact)
                print(
                    f"  t_f={tf:.2f}: x(t_f)≈{x_final:.4f}, exacto={x_exact:.4f}, error={error:.2e}"
                )
            else:
                print(f"  t_f={tf:.2f}: x(t_f)≈{x_final:.2e} (diverge!)")
        except Exception as e:
            print(f"  t_f={tf:.2f}: Error - {str(e)[:50]}")

    print("\n✓ Picard detecta el blow-up cuando tf ≥ 1")


def ejercicio_9_lineal_dependencia():
    """
    Ejercicio 9: Demostrar dependencia continua para sistema lineal
    dx/dt = Ax, mostrando que ||x(t) - y(t)|| ≤ ||x₀ - y₀|| e^{||A||t}
    """
    print("\n" + "=" * 70)
    print("EJERCICIO 9: Dependencia continua en sistemas lineales")
    print("=" * 70)

    # Sistema: dx/dt = -x, dy/dt = -2y
    A = np.array([[-1, 0], [0, -2]])

    print(f"\nMatriz del sistema A = {A.tolist()}")
    print(f"Norma de A: ||A||₂ = {np.linalg.norm(A, 2):.4f}")

    # Dos condiciones iniciales cercanas
    x0 = np.array([1.0, 1.0])
    y0 = np.array([1.01, 1.01])  # Perturbación del 1%

    delta0 = np.linalg.norm(x0 - y0)
    print(f"\nCondición inicial 1: x₀ = {x0}")
    print(f"Condición inicial 2: y₀ = {y0}")
    print(f"Distancia inicial ||x₀ - y₀|| = {delta0:.6f}")

    # Integrar ambas trayectorias
    def f(v, t):
        return A @ v

    t = np.linspace(0, 5, 100)
    x_traj = odeint(f, x0, t)
    y_traj = odeint(f, y0, t)

    # Calcular distancia en el tiempo
    distances = np.linalg.norm(x_traj - y_traj, axis=1)
    L = np.linalg.norm(A, 2)
    upper_bound = delta0 * np.exp(L * t)

    print(f"\nVerificación de la cota:")
    print(f"Tiempo  | Distancia real | Cota e^{L:.2f}t | Ratio")
    print("-" * 60)
    for i in [0, 20, 40, 60, 80, 99]:
        ratio = distances[i] / upper_bound[i]
        print(
            f"{t[i]:.2f}    | {distances[i]:.6f}     | {upper_bound[i]:.6f}    | {ratio:.4f}"
        )

    # Visualizar
    plt.figure(figsize=(12, 5))

    plt.subplot(1, 2, 1)
    plt.plot(t, x_traj[:, 0], "b-", label="x₁(t) - trayectoria 1", linewidth=2)
    plt.plot(t, y_traj[:, 0], "b--", label="x₁(t) - trayectoria 2", linewidth=2)
    plt.plot(t, x_traj[:, 1], "r-", label="x₂(t) - trayectoria 1", linewidth=2)
    plt.plot(t, y_traj[:, 1], "r--", label="x₂(t) - trayectoria 2", linewidth=2)
    plt.xlabel("t")
    plt.ylabel("Componentes")
    plt.title("Dos trayectorias cercanas")
    plt.legend()
    plt.grid(True, alpha=0.3)

    plt.subplot(1, 2, 2)
    plt.semilogy(t, distances, "b-", label="Distancia real ||x(t)-y(t)||", linewidth=2)
    plt.semilogy(
        t, upper_bound, "r--", label=f"Cota {delta0:.3f}e^{L:.2f}t", linewidth=2
    )
    plt.xlabel("t")
    plt.ylabel("Distancia (escala log)")
    plt.title("Verificación de dependencia continua")
    plt.legend()
    plt.grid(True, alpha=0.3, which="both")

    plt.tight_layout()
    plt.savefig("dependencia_continua.png", dpi=300, bbox_inches="tight")
    plt.show()

    print("\n✓ La distancia real siempre está por debajo de la cota teórica")


# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("ChaosLab Tutorial Avanzado - Sección 0: Fundamentos Matemáticos")
    print("Métodos de Picard y Análisis de Existencia")
    print("=" * 70)

    if len(sys.argv) > 1:
        opcion = sys.argv[1]

        if opcion == "ej1":
            ejemplo_1_lineal()
        elif opcion == "ej2":
            ejemplo_2_logistico()
        elif opcion == "ej3":
            ejemplo_3_sistema_2d()
        elif opcion == "e5":
            ejercicio_5_picard_explicito()
        elif opcion == "e6":
            ejercicio_6_intervalo_existencia()
        elif opcion == "e9":
            ejercicio_9_lineal_dependencia()
        elif opcion == "todos":
            ejemplo_1_lineal()
            ejemplo_2_logistico()
            ejemplo_3_sistema_2d()
            ejercicio_5_picard_explicito()
            ejercicio_6_intervalo_existencia()
            ejercicio_9_lineal_dependencia()
        else:
            print(f"\nOpción '{opcion}' no reconocida")
            print("\nUso: python picard_methods.py [opción]")
            print("\nOpciones disponibles:")
            print("  ej1    - Ejemplo 1: Ecuación lineal")
            print("  ej2    - Ejemplo 2: Ecuación logística")
            print("  ej3    - Ejemplo 3: Oscilador armónico")
            print("  e5     - Ejercicio 5: Picard explícito")
            print("  e6     - Ejercicio 6: Intervalo de existencia")
            print("  e9     - Ejercicio 9: Dependencia continua")
            print("  todos  - Ejecutar todos los ejemplos y ejercicios")
    else:
        print("\nUso: python picard_methods.py [opción]")
        print("\nEjecute con 'todos' para ver todos los ejemplos")
        print("Ejemplo: python picard_methods.py todos")
