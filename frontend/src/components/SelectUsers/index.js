import React from "react";
import { useEffect, useState} from "react";
import api from "../../services/api";
import Select from "react-select";
import toastError from "../../errors/toastError";

const SelectUsers = ({onChange, selectedUsers, disabled}) => {
    const [users, setUsers] = useState([]);
    const [internalSelectedUsers, setInternalSelectedUsers] = useState([]);

    useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			const fetchUsers = async () => {
				try {
					const { data } = await api.get("/users", {params: {all: true}});
					setUsers(data.users);
                    if (selectedUsers && selectedUsers.length > 0) {
                        setInternalSelectedUsers(selectedUsers.map((user) => {return {value: user.id, label: user.name, color: user.color}}));
                    } else {
                        setInternalSelectedUsers([]);
                    }
				} catch (err) {
					toastError(err);
				}
			};
			fetchUsers();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [selectedUsers]);

    const handleChange = (changedUsers) => {
        setInternalSelectedUsers(changedUsers);
        if (onChange) {
            onChange(changedUsers);
        }
    };

    return (
        <Select
            options={users.map((user) => {return {value: user.id, label: user.name, color: user.color}})}
            isMulti
            onChange={handleChange}
            onRemove={handleChange}
            value={internalSelectedUsers}
            isDisabled={disabled}
            className="basic-multi-select"
            placeholder="Selecione os atendentes..."
            classNamePrefix="select"
            menuPosition={'fixed'}
            menuPortalTarget={document.body}
            />
    );
};

export default SelectUsers;