import React, { useState } from "react";
import { Field } from "formik";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
}));

const StatusSelect = ({ selected, onChange }) => {
    const classes = useStyles();

    const handleChange = e => {
		onChange(e.target.value);
	};

    return (
        <div>
            <FormControl
                variant="outlined"
                className={classes.formControl}
                margin="dense"
            >
                <InputLabel id="status-selection-input-label">
                    {i18n.t("dashboard.status")}
                </InputLabel>

                <Select
                    label={i18n.t("dashboard.status")}
                    labelId="status-selection-label"
                    id="status-selection"
                    value={selected}
                    onChange={handleChange}  
                    fullWidth
                >
                    <MenuItem key="all" value="all">Todos</MenuItem>
                    <MenuItem key="open" value="open">Aberto</MenuItem>
                    <MenuItem key="closed" value="closed">Fechado</MenuItem>
                    <MenuItem key="pending" value="pending">Aguardando</MenuItem>
                </Select>
            </FormControl>
        </div>);
};

export default StatusSelect;