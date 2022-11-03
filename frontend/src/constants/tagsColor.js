import chroma from "chroma-js";

const colourStyles = {
    menuPortal: base => ({ ...base,
        zIndex: 9999
    }),
    control: styles => ({ ...styles,
        backgroundColor: 'white'
    }),
    option: (styles, {
        data,
        isDisabled,
        isFocused,
        isSelected
    }) => {
        if (!data.color) {
            data.color = '#FFFFFF';
        }
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor: color,
            color: isDisabled ?
                '#ccc' :
                isSelected ?
                chroma.contrast(color, 'white') > 2 ?
                'white' :
                'black' :
                data.color,
            cursor: isDisabled ? 'not-allowed' : 'default',

            ':active': {
                ...styles[':active'],
                backgroundColor:
                    !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
            },
        };
    },
    multiValue: (styles, {
        data
    }) => {
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor: color.alpha(0.1).css(),
        };
    },
    multiValueLabel: (styles, {
        data
    }) => ({
        ...styles,
        color: data.color,
    }),
    multiValueRemove: (styles, {
        data
    }) => ({
        ...styles,
        color: data.color,
        ':hover': {
            backgroundColor: data.color,
            color: 'white',
        },
    }),
};

export default colourStyles;