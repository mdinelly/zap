import React from "react";
import {
    useEffect,
    useState
} from "react";
import api from "../../services/api";
import AsyncSelect from "react-select";
import toastError from "../../errors/toastError";

const SelectContacts = ({
    onChange,
    selectedContacts,
    disabled
}) => {
    const [contacts, setContacts] = useState([]);
    const [internalSelectedContacts, setInternalSelectedContacts] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    var params = {};
                    if (query) {
                        params.searchParam = query;
                    }

                    const {
                        data
                    } = await api.get("/contacts", {
                        params
                    });
                    setContacts(data.contacts);
                    if (selectedContacts && selectedContacts.length > 0) {
                        setInternalSelectedContacts(selectedContacts.map((contact) => {
                            return {
                                value: contact.id,
                                label: contact.name,
                                color: contact.color
                            }
                        }));
                    } else {
                        setInternalSelectedContacts([]);
                    }
                    setLoading(false);
                } catch (err) {
                    setLoading(false);
                    toastError(err);
                }
            };
            fetchContacts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [selectedContacts, query]);

    const handleChange = (changedContacts) => {
        setInternalSelectedContacts(changedContacts);
        if (onChange) {
            onChange(changedContacts);
        }
    };

    let debounce;

    const handleInputChange = (inputValue, callback) => {
        if (debounce) {
            clearTimeout(debounce);
        }
        debounce = setTimeout(() => {
            setQuery(inputValue);
        }, 500);
    };

    const NoOptionsMessage = props => {
        return ( <
            div { ...props.innerProps
            }
            style = {
                props.getStyles('loadingMessage', props)
            } >
            Contato não encontrado...
            <
            /div>
        );
    }

    const LoadingMessage = props => {
        return ( <
            div { ...props.innerProps
            }
            style = {
                props.getStyles('loadingMessage', props)
            } >
            Carregando...
            <
            /div>
        );
    }

    return ( <
        AsyncSelect options = {
            contacts.map((contact) => {
                return {
                    value: contact.id,
                    label: contact.name,
                    color: contact.color
                }
            })
        }
        isMulti onChange = {
            handleChange
        }
        isDisabled = {
            disabled
        }
        onRemove = {
            handleChange
        }
        onInputChange = {
            handleInputChange
        }
        isLoading = {
            loading
        }
        components = {
            {
                LoadingMessage,
                NoOptionsMessage
            }
        }
        value = {
            internalSelectedContacts
        }
        className = "basic-multi-select"
        placeholder = "Selecione os contatos..."
        classNamePrefix = "select"
        menuPosition = {
            'fixed'
        }
        menuPortalTarget = {
            document.body
        }
        styles = {
            {
                menuPortal: base => ({ ...base,
                    zIndex: 9999
                })
            }
        }
        />
    );
};

export default SelectContacts;