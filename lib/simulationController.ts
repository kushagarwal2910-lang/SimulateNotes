/**
 * Simulation Sandbox Controller Engine
 * Programmatically inspects, highlights, and smoothly manipulates simulation controls
 * (sliders, buttons, dropdowns) inside an iframe sandbox with real-time React/GSAP event dispatching.
 */

export interface SimulationControlInfo {
  index: number;
  label: string;
  type: "range" | "select" | "button";
  min?: number;
  max?: number;
  step?: number;
  currentValue: number | string;
  element: HTMLElement;
}

/**
 * Extracts all interactive controls from the simulation iframe.
 */
export function getAvailableControls(iframe: HTMLIFrameElement | null): SimulationControlInfo[] {
  if (!iframe) return [];

  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return [];

    const controls: SimulationControlInfo[] = [];

    // Find all range inputs (sliders)
    const rangeInputs = doc.querySelectorAll<HTMLInputElement>('input[type="range"]');
    rangeInputs.forEach((input, index) => {
      // Find parent container or preceding label text
      let label = "";
      const parent = input.closest("div");
      if (parent) {
        const textNodes = parent.querySelectorAll("span, label, p");
        if (textNodes.length > 0) {
          label = textNodes[0].textContent?.trim() || "";
        }
      }
      if (!label) {
        label = input.name || input.id || `Slider ${index + 1}`;
      }

      controls.push({
        index,
        label,
        type: "range",
        min: parseFloat(input.min) || 0,
        max: parseFloat(input.max) || 100,
        step: parseFloat(input.step) || 1,
        currentValue: parseFloat(input.value) || 0,
        element: input,
      });
    });

    return controls;
  } catch (err) {
    console.error("Failed to inspect simulation controls inside iframe:", err);
    return [];
  }
}

/**
 * Highlights a specific control inside the iframe with a glowing outline.
 */
export function highlightControl(
  iframe: HTMLIFrameElement | null,
  target: string | number
): void {
  if (!iframe) return;

  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const controls = getAvailableControls(iframe);
    let targetCtrl: SimulationControlInfo | undefined;

    if (typeof target === "number") {
      targetCtrl = controls[target];
    } else {
      const lower = target.toLowerCase();
      targetCtrl = controls.find((c) => c.label.toLowerCase().includes(lower));
    }

    if (!targetCtrl) return;

    const el = targetCtrl.element as HTMLElement;
    const origOutline = el.style.outline;
    const origBoxShadow = el.style.boxShadow;
    const origTransition = el.style.transition;

    el.style.transition = "all 0.3s ease";
    el.style.outline = "2px solid #38bdf8";
    el.style.boxShadow = "0 0 15px rgba(56, 189, 248, 0.6)";

    setTimeout(() => {
      el.style.outline = origOutline;
      el.style.boxShadow = origBoxShadow;
      el.style.transition = origTransition;
    }, 2000);
  } catch (err) {
    console.error("Error highlighting control:", err);
  }
}

/**
 * Smoothly slides a range input from its current value to targetValue over durationMs,
 * continuously dispatching 'input' and 'change' events so React and GSAP state update.
 */
export function smoothSetSlider(
  iframe: HTMLIFrameElement | null,
  target: string | number,
  targetValue: number,
  durationMs: number = 700
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!iframe) {
      resolve(false);
      return;
    }

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        resolve(false);
        return;
      }

      const controls = getAvailableControls(iframe);
      let targetCtrl: SimulationControlInfo | undefined;

      if (typeof target === "number") {
        targetCtrl = controls[target];
      } else {
        const lower = target.toLowerCase();
        targetCtrl = controls.find((c) => c.label.toLowerCase().includes(lower));
        if (!targetCtrl) {
          // fallback to first range control if not found
          targetCtrl = controls.find((c) => c.type === "range");
        }
      }

      if (!targetCtrl || targetCtrl.type !== "range") {
        resolve(false);
        return;
      }

      const input = targetCtrl.element as HTMLInputElement;
      const startValue = parseFloat(input.value) || 0;
      const min = targetCtrl.min ?? 0;
      const max = targetCtrl.max ?? 100;
      const clampedTarget = Math.max(min, Math.min(max, targetValue));

      highlightControl(iframe, target);

      const startTime = performance.now();

      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / durationMs);

        // Ease-in-out quadratic interpolation
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentValue = startValue + (clampedTarget - startValue) * eased;

        // Use native setter to trigger React 18 onChange listeners
        setNativeInputValue(input, currentValue.toString());

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setNativeInputValue(input, clampedTarget.toString());
          resolve(true);
        }
      }

      requestAnimationFrame(update);
    } catch (err) {
      console.error("Error in smoothSetSlider:", err);
      resolve(false);
    }
  });
}

/**
 * Overrides React 18's internal value tracker to ensure onChange & onInput fires properly.
 */
function setNativeInputValue(element: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}
