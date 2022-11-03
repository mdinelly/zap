import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import api from "../../services/api";

const AsyncSelect = ({ url, dictKey, onChange, label, initialValue }) => {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const [query, setQuery] = React.useState(null);
    const [internalValue, setInternalValue] = React.useState(initialValue);
    const loading = open && options.length === 0;
    let debounce = null;

    React.useEffect(() => {
        setInternalValue(initialValue);
    }, [internalValue]);

    React.useEffect(() => {
        let active = true;

        (async () => {
            let params = {};
            if (query) {
                params.searchParam = query;
            }
            const { data } = await api.get(url, { params });
            
            if (active) {
                setOptions(data[dictKey]);
            }
        })();

        return () => {
            active = false;
        };
    }, [query]);

    React.useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

    const onInputChange = (event, value) => {
        if (debounce) {
            clearTimeout(debounce);
        }
        debounce = setTimeout(() => {
            setQuery(value);
        }, 500);
    }

    return (
        <Autocomplete
            id="asynchronous-demo"
            style={{ width: 300 }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            getOptionSelected={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            options={options}
            loading={loading}
            onChange={onChange}
            onInputChange={onInputChange}
            defaultValue={initialValue}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    variant="outlined"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default AsyncSelect;