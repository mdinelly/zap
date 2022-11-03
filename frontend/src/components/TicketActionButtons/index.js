import React, { useContext, useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import {  Replay, Repeat,  DeleteForever, DoneAll } from "@material-ui/icons";
import TransferTicketModal from "../TransferTicketModal";
import ConfirmationModal from "../ConfirmationModal";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles(theme => ({
	actionButtons: {
		marginRight: 6,
		flex: "none",
		alignSelf: "center",
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(1),
		},
	},
}));

const TicketActionButtons = ({ ticket, handleClose }) => {
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
	const isMounted = useRef(true);

	const classes = useStyles();
	const history = useHistory();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const ticketOptionsMenuOpen = Boolean(anchorEl);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleOpenTransferModal = e => {
		setTransferTicketModalOpen(true);
		if (typeof(handleClose) == "function") handleClose();
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		if (typeof(handleClose) == "function") handleClose();
	};

	const handleCloseTransferTicketModal = () => {
		if (isMounted.current) {
			setTransferTicketModalOpen(false);
		}
	};

	const handleOpenTicketOptionsMenu = e => {
		//setAnchorEl(e.currentTarget);
	};

	const handleCloseTicketOptionsMenu = e => {
		setAnchorEl(null);
	};

	const handleDeleteTicket = async () => {
		try {
			await api.delete(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleUpdateTicketStatus = async (e, status, userId) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${ticket.id}`, {
				status: status,
				userId: userId || null,
			});

			setLoading(false);
			if (status === "open") {
				history.push(`/tickets/${ticket.id}`);
			} else {
				history.push("/tickets");
			}
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	return (
		<div className={classes.actionButtons}>
			{ticket.status === "closed" && (
				<ButtonWithSpinner
					style={{ backgroundColor: 'black', color: 'white', fontSize: '9px', margin: '2px', borderRadius: '0px' }}
					loading={loading}
					startIcon={<Replay />}
					size="small"
					variant="contained"
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{i18n.t("messagesList.header.buttons.reopen")}
				</ButtonWithSpinner>
			)}
			{ticket.status === "open" && (
				<>
					<ButtonWithSpinner
						style={{ backgroundColor: 'black', color: 'white', fontSize: '9px', margin: '2px', borderRadius: '0px' }}
						loading={loading}
						startIcon={<Replay />}
						size="small"
						variant="contained"
						onClick={e => handleUpdateTicketStatus(e, "pending", null)}
					>
						{i18n.t("messagesList.header.buttons.return")}
					</ButtonWithSpinner>
					<ButtonWithSpinner
						style={{ backgroundColor: 'green', color: 'white', fontSize: '9px', margin: '2px', borderRadius: '0px' }}
						loading={loading}
						startIcon={<DoneAll />}
						size="small"
						variant="contained"
						onClick={e => handleUpdateTicketStatus(e, "closed", user?.id)}
					>
						{i18n.t("messagesList.header.buttons.resolve")}
					</ButtonWithSpinner>

					<ButtonWithSpinner
						style={{ backgroundColor: 'yellow', color: 'black', fontSize: '9px', margin: '2px', borderRadius: '0px' }}
						loading={loading}
						startIcon={<Repeat />}
						size="small"
						variant="contained"
						onClick={handleOpenTransferModal}
					>
						Transferir
					</ButtonWithSpinner>

					<Can
						role={user.profile}
						perform="ticket-options:deleteTicket"
						yes={() => (
							<ButtonWithSpinner
								style={{ backgroundColor: 'red', color: 'white', fontSize: '9px', margin: '2px', borderRadius: '0px' }}
								loading={loading}
								startIcon={<DeleteForever />}
								size="small"
								variant="contained"
								onClick={handleOpenConfirmationModal}
							>
								Excluir
							</ButtonWithSpinner>
						)}
					/>

					<ConfirmationModal
						title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")} #${
							ticket.id
						}?`}
						open={confirmationOpen}
						onClose={setConfirmationOpen}
						onConfirm={handleDeleteTicket}
					>
						{i18n.t("ticketOptionsMenu.confirmationModal.message")}
					</ConfirmationModal>
					<TransferTicketModal
						modalOpen={transferTicketModalOpen}
						onClose={handleCloseTransferTicketModal}
						ticketid={ticket.id}
					/>
				</>
				
			)}
			{ticket.status === "pending" && (
				<ButtonWithSpinner
					style={{ backgroundColor: 'black', color: 'white', fontSize: '9px', margin: '2px', borderRadius: '0px' }}
					loading={loading}
					size="small"
					variant="contained"
					onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
				>
					{i18n.t("messagesList.header.buttons.accept")}
				</ButtonWithSpinner>
			)}
		</div>
	);
};

export default TicketActionButtons;
