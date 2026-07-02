//@ts-nocheck
import classNames from "classnames";
import React, { CSSProperties, useEffect } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import ReactSelect, {
  components,
  GroupBase,
  OptionProps,
  Props,
} from "react-select";

const MoreSelectedBadge = ({ items }) => {
  const title = items.join(", ");
  const length = items.length;
  const label = `+${length}`;

  return (
    <p title={title} className="p-1 text-sm bg-background-700 rounded-sm">
      {label}
    </p>
  );
};

const MultiValue = ({ index, getValue, ...props }) => {
  const maxToShow = 1;
  const overflow = getValue()
    .slice(maxToShow)
    .map((x: any) => x.label);

  return index < maxToShow ? (
    // @ts-ignore
    (<components.MultiValue {...props} />)
  ) : index === maxToShow ? (
    <MoreSelectedBadge items={overflow} />
  ) : null;
};

const Option: React.ComponentType<
  OptionProps<unknown, boolean, GroupBase<unknown>>
> = ({ innerRef, getValue, children, innerProps, ...props }) => {
  const { className, ...divProps } = innerProps;

  return (
    <div
      ref={innerRef}
      className={classNames(
        "relative cursor-pointer rounded-lg px-3 py-2 transition duration-200",
        props.isFocused && "bg-white/10 text-primary-300",
        props.isSelected && "text-primary-300",
        className
      )}
      {...divProps}
    >
      {children}

      {props.isSelected && (
        <AiFillCheckCircle className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600 rounded-full bg-white" />
      )}
    </div>
  );
};

const Select = React.forwardRef<any, Props>(
  ({ components, styles, ...props }, ref) => {
    const [portalTarget, setPortalTarget] = React.useState<HTMLElement>();
    // Stable id across SSR + client render to avoid react-select hydration
    // mismatches (server/client otherwise generate different react-select-N ids).
    const generatedId = React.useId();

    useEffect(() => {
      setPortalTarget(document.body);
    }, []);

    return (
      <ReactSelect
        ref={ref}
        instanceId={generatedId}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "#ef4444",
            primary75: "#f87171",
            primary50: "#fca5a5",
            primary20: "#fecaca",
          },
        })}
        styles={{
          control: (provided, state) => {
            return {
              ...provided,
              backgroundColor: "rgba(17,25,40,0.55)",
              backdropFilter: "blur(16px) saturate(170%)",
              border: state.isFocused
                ? "1px solid rgba(239,68,68,0.6)"
                : "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.75rem",
              minHeight: "46px",
              minWidth: "11rem",
              maxWidth: "14rem",
              boxShadow: state.isFocused
                ? "0 0 0 3px rgba(239,68,68,0.15)"
                : "none",
              cursor: "pointer",
              transition: "border-color 200ms, box-shadow 200ms",
              ":hover": {
                borderColor: "rgba(255,255,255,0.25)",
              },
            };
          },
          menu: (provided) => {
            return {
              ...provided,
              backgroundColor: "rgba(17,25,40,0.92)",
              backdropFilter: "blur(16px) saturate(170%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.75rem",
              overflow: "hidden",
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            };
          },
          menuList: (provided) => ({ ...provided, padding: "0.25rem" }),
          placeholder: (provided) => ({
            ...provided,
            color: "rgba(255,255,255,0.4)",
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            color: "rgba(255,255,255,0.4)",
            ":hover": { color: "rgba(255,255,255,0.8)" },
          }),
          indicatorSeparator: () => ({ display: "none" }),
          menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
          singleValue: (provided) => {
            return { ...provided, color: "#fff" };
          },
          multiValue: (provided) => {
            return {
              ...provided,
              backgroundColor: "#262626",
              maxWidth: "70%",
            };
          },
          multiValueLabel: (provided) => {
            return { ...provided, color: "white" };
          },
          multiValueRemove: (provided) => {
            return {
              ...provided,
              color: "gray",
              ":hover": {
                backgroundColor: "transparent",
                color: "white",
              },
              transition: "all 300ms",
            };
          },

          input: (provided) => {
            return { ...provided, color: "white" };
          },

          ...styles,
        }}
        hideSelectedOptions={false}
        noOptionsMessage={() => "No options"}
        components={{ MultiValue, Option, ...components }}
        isClearable
        menuPortalTarget={portalTarget}
        {...props}
      />
    );
  }
);

Select.displayName = "Select";

export default React.memo(Select);
