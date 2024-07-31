import {html} from "npm:htl";
export {colorWidget};

function colorWidget(options = {}) {
    let {
      ranges = [255, 255, 255],
      channels = "RGB",
      value = [127, 127, 127]
    } = options;
    const widget = html`<form class="colorwidget">`;
  
    const setChannelValue = (i, v) => {
      widget.value[i] = +v;
      widget.dispatchEvent(new CustomEvent("input"));
    };
    const inputs = [];
    for (let i of [0, 1, 2]) {
      const input = html`<input type=number min=0 max=${ranges[i]} step=1 value=${value[i]} >`;
      Object.assign(input.style, { width: "3em" });
      input.oninput = () => setChannelValue(i, input.value);
      inputs.push(input);
      const label = html`<label>${channels[i]}${input}`;
      widget.append(label);
    }
    Object.defineProperty(widget, "value", {
      get() {
        return value;
      },
      set(v) {
        value = v.map((x, i) => Math.min(ranges[i], Math.max(0, Math.round(x))));
        inputs.forEach((inp, i) => (inp.value = value[i]));
      }
    });
    widget.value = value;
    return widget;
  }