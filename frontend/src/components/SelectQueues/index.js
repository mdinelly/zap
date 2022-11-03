import React from "react";
import { useEffect, useState} from "react";
import api from "../../services/api";
import Select from "react-select";
import toastError from "../../errors/toastError";

const SelectQueues = ({onChange, selectedQueues, disabled}) => {
    const [queues, setQueues] = useState([]);
    const [internalSelectedQueues, setInternalSelectedQueues] = useState([]);

    useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			const fetchQueues = async () => {
				try {
					const { data } = await api.get("/queue", {params: {all: true}});
					setQueues(data);
                    if (selectedQueues && selectedQueues.length > 0) {
                        setInternalSelectedQueues(selectedQueues.map((queue) => {return {value: queue.id, label: queue.name, color: queue.color}}));
                    } else {
                        setInternalSelectedQueues([]);
                    }
				} catch (err) {
					toastError(err);
				}
			};
			fetchQueues();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [selectedQueues]);

    const handleChange = (changedQueues) => {
        setInternalSelectedQueues(changedQueues);
        if (onChange) {
            onChange(changedQueues);
        }
    };

    return (
        <Select
            options={queues.map((queue) => {return {value: queue.id, label: queue.name, color: queue.color}})}
            isMulti
            onChange={handleChange}
            onRemove={handleChange}
            value={internalSelectedQueues}
            isDisabled={disabled}
            className="basic-multi-select"
            placeholder="Selecione os setores..."
            classNamePrefix="select"
            menuPosition={'fixed'}
            menuPortalTarget={document.body}
            />
    );
};

export default SelectQueues;