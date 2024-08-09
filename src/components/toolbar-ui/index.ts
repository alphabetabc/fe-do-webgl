import * as d3 from "d3";
import { GLHelper } from "@utils";

const toolbar = d3.select("#toolbar");
GLHelper.Dom.setStyle(toolbar.node() as any, {
    left: "880px",
    top: "50px",
});

const form = toolbar.append("form").on("submit", (e) => {
    e.preventDefault();
});

const createFormItem = (
    group: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
    record: { groupName: string; name: string; value: any; tag?: string; type?: string },
) => {
    const formId = `${record.groupName ?? "default"}:${record.name}`;

    const formItem = group.append("label").attr("class", "form-item").attr("for", formId).style("display", "block").style("margin-bottom", "5px");

    const label = formItem.append("span").classed("label-text", true).html(record.name).style("display", "inline-block");

    const valueElTag = record.tag ?? "input";
    const valueElType = record.type ?? "number";

    const value = formItem
        .append(valueElTag)
        .attr("value", record.value)
        .attr("id", formId)
        .attr("name", formId)
        .attr("data-form-name", record.name)
        .attr("type", valueElType);

    if (valueElType === "checkbox") {
        value.property("checked", record.value);
    }

    return {
        formItem,
        label,
        value,
    };
};

const createFormGroup = (groupName: string, data: { name: string; value: any; step?: number }[]) => {
    const group = form.append("div").attr("class", "group").style("margin-bottom", "10px").style("outline", "1px dashed").style("padding", "5px");

    group.append("div").text(groupName);

    const formItem = group
        .selectAll(".form-item")
        .data(data.map((d) => ({ ...d, formId: `${groupName}:${d.name}` })))
        .join("label")
        .style("display", "block")
        .style("white-space", "nowrap")
        .attr("class", "form-item")
        .attr("for", (d) => d.formId);

    formItem
        .append("span")
        .classed("label-text", true)
        .html((d) => d.name)
        .style("display", "inline-block")
        .style("min-width", "50px");

    formItem
        .append("input")
        .attr("type", "number")
        .attr("id", (d) => d.formId)
        .attr("name", (d) => d.formId)
        .attr("value", (d) => d.value)
        .attr("data-form-name", (d) => d.name)
        .attr("step", (d) => d.step ?? 0.01)
        .style("margin-left", "5px");

    return { group, formItem };
};

/**
 * 触发 表单值更新
 */
const updateFormValues = (values: Record<string, any>, autoTrigger: boolean = true) => {
    let changed = false;
    Array.from(form.node().elements).forEach((el: any) => {
        const formName = el.dataset.formName;
        const value = values[formName];

        if (value !== undefined) {
            changed = true;
            el.value = value;
        }
    });

    if (changed && autoTrigger) {
        form.dispatch("change");
    }
};

export {
    //
    toolbar,
    form as toolbarForm,
    updateFormValues,
    createFormGroup,
    createFormItem,
};
