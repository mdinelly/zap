import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete from '@material-ui/lab/Autocomplete';

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import SelectContacts from "../SelectContacts";
import AsyncSelect from "../AsyncSelect";
import { DatePicker, DateRangePicker } from 'rsuite';

const useStyles = makeStyles(theme => ({
	root: {
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		width: "100%"
	},
	datePickerField: {
		width: "100%",
		zIndex: 1000000,
		marginBottom: 10
	},
	datePickerFieldMenu: {
		zIndex: 9999999999
	},

	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
	textFieldNameContainer: {
		width: "100%"
	},
	textFieldContentContainer: {
		width: "100%"
	}
}));

const ScheduledMessageSchema = Yup.object().shape({
	date: Yup.date().min(new Date()),
	content: Yup.string().min(8, "Informe uma mensagem de no mínimo 8 caracteres").max(60000, "Informe uma mensagem de no máximo 60.000 caracteres"),
});

const ScheduledMessageModal = ({ open, onClose, scheduledMessageId, initialValues, onSave }) => {
	const classes = useStyles();
	const isMounted = useRef(true);

	const initialState = {
		date: new Date(),
		content: "",
		contactId: null
	};

	const [scheduledMessage, setScheduledMessage] = useState(initialState);
	const [initialContact, setInitialContact] = useState({});

	const locale = {
		sunday: 'Dom',
		monday: 'Seg',
		tuesday: 'Ter',
		wednesday: 'Qua',
		thursday: 'Qui',
		friday: 'Sex',
		saturday: 'Sáb',
		ok: 'OK',
		today: 'Hoje',
		yesterday: 'Ontem',
		last7Days: 'Últimos 7 dias',
		hours: 'Horas',
		minutes: 'Minutos',
		seconds: 'Segundos',
		last30Days: 'Últimos 30 dias',
		thisMonth: 'Esse mês',
		lastMonth: 'Último mês',
		thisYear: 'Esse Ano',
		lastYear: 'Último Ano',
		formattedMonthPattern: 'MMM, YYYY',
  		formattedDayPattern: 'DD MMM, YYYY'
	};

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		const fetchScheduledMessage = async () => {
			if (initialValues) {
				setScheduledMessage(prevState => {
					return { ...prevState, ...initialValues };
				});
			}

			if (!scheduledMessageId) return;

			try {
				const { data } = await api.get(`/scheduled-messages/${scheduledMessageId}`);
				setInitialContact(data.contact);
				if (isMounted.current) {
					setScheduledMessage(data);
				}
			} catch (err) {
				toastError(err);
			}
		};

		fetchScheduledMessage();
	}, [scheduledMessageId, open, initialValues]);

	const handleClose = () => {
		onClose();
		setScheduledMessage(initialState);
	};

	const handleSaveScheduledMessage = async values => {
		try {
			if (scheduledMessageId) {
				await api.put(`/scheduled-messages/${scheduledMessageId}`, values);
				handleClose();
			} else {
				const { data } = await api.post("/scheduled-messages", values);
				if (onSave) {
					onSave(data);
				}
				handleClose();
			}
			toast.success(i18n.t("scheduledMessageModal.success"));
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
				<DialogTitle id="form-dialog-title">
					{scheduledMessageId
						? `${i18n.t("scheduledMessageModal.title.edit")}`
						: `${i18n.t("scheduledMessageModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={scheduledMessage}
					enableReinitialize={true}
					validationSchema={ScheduledMessageSchema}
					onSubmit={(values, actions) => {
						console.log('submiting');
						setTimeout(() => {
							handleSaveScheduledMessage(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, errors, touched, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<Typography variant="subtitle1" gutterBottom>
									{i18n.t("scheduledMessageModal.form.mainInfo")}
								</Typography>
								<div className={classes.textFieldNameContainer}>
									<DatePicker 
										format="DD/MM/YYYY HH:mm"
										label={i18n.t("scheduledMessageModal.form.date")}
										onChange={(value) => {values.date = value}}
										className={classes.datePickerField}
										container={document.body}
										menuClassName={classes.datePickerFieldMenu}
										defaultValue={values.date}
										locale={locale}
										ranges={[
											{
												label: 'Now',
												value: new Date()
											}
										]}
									/>
								</div>
								<div className={classes.textFieldNameContainer}>
									<AsyncSelect url="/contacts" initialValue={initialContact} dictKey="contacts" onChange={(event, value) => {if (value) values.contactId = value.id}} label="Contato" />
								</div>
								<div className={classes.textFieldContentContainer}>
									<Field
										as={TextField}
										label={i18n.t("scheduledMessageModal.form.content")}
										name="content"
										error={touched.content && Boolean(errors.content)}
										helperText={touched.content && errors.content}
										placeholder="Conteúdo da mensagem"
										variant="outlined"
										margin="dense"
										className={classes.textField}
										multiline
										rows={5}
										fullwidth
									/>
								</div>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("scheduledMessageModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{scheduledMessageId
										? `${i18n.t("scheduledMessageModal.buttons.okEdit")}`
										: `${i18n.t("scheduledMessageModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default ScheduledMessageModal;
