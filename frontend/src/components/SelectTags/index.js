import React from "react";
import {
    useEffect,
    useState
} from "react";
import api from "../../services/api";
import colourStyles from "../../constants/tagsColor";
import Select from "react-select";
import toastError from "../../errors/toastError";

const SelectTags = ({
    onChange,
    selectedTags,
    disabled
}) => {
    const [tags, setTags] = useState([]);
    const [internalSelectedTags, setInternalSelectedTags] = useState([]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const fetchTags = async () => {
                try {
                    const {
                        data
                    } = await api.get("/tags", {
                        params: {
                            all: true
                        }
                    });
                    setTags(data.tags);
                    if (selectedTags && selectedTags.length > 0) {
                        setInternalSelectedTags(selectedTags.map((tag) => {
                            return {
                                value: tag.id,
                                label: tag.name,
                                color: tag.color
                            }
                        }));
                    } else {
                        setInternalSelectedTags([]);
                    }
                } catch (err) {
                    toastError(err);
                }
            };
            fetchTags();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [selectedTags]);

    const handleChange = (changedTags) => {
        setInternalSelectedTags(changedTags);
        if (onChange) {
            onChange(changedTags);
        }
    };

    return ( <
        Select options = {
            tags.map((tag) => {
                return {
                    value: tag.id,
                    label: tag.name,
                    color: tag.color
                }
            })
        }
        isMulti onChange = {
            handleChange
        }
        onRemove = {
            handleChange
        }
        value = {
            internalSelectedTags
        }
        isDisabled = {
            disabled
        }
        className = "basic-multi-select"
        placeholder = "Selecione as tags..."
        classNamePrefix = "select"
        menuPosition = {
            'fixed'
        }
        menuPortalTarget = {
            document.body
        }
        styles = {
            colourStyles
        }
        />
    );
};

export default SelectTags;