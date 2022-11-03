import React, { useEffect, useState } from "react";
import { Field } from "formik";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
}));

const SetorSelect = ({ selected, onChange}) => {
    const classes = useStyles();
    const [queues, setQueues] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/queue");
                data.push({id: 999,name:"Todos"});
                setQueues(data);
            } catch (err) {
                toastError(err);
            }
        })();
    }, []);

    const handleChange = e => {
		onChange(e.target.value);
	};

    return (
        <div>
            <FormControl
                variant="outlined"
                className={classes.FormControl}
                margin="dense"
                fullWidth
            >
                <InputLabel id="setor-selection-input-label">
                    {i18n.t("dashboard.queue")}
                </InputLabel>

                <Select
                    label={i18n.t("dashboard.queue")}
                    labelId="setor-selection-label"
                    id="setor-selection"
                    value={selected}
                    onChange={handleChange}
                    fullWidth
                >
                    {queues.map(queue => (
                        <MenuItem key={queue.id} value={queue.id}>
                            {queue.name}
                        </MenuItem>
                    ))}
                </Select>

            </FormControl>
        </div>
    );
};

export default SetorSelect;
