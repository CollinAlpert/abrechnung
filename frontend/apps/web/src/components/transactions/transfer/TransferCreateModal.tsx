import React, { ReactNode } from "react";
import { toast } from "react-toastify";
import { Form, Formik, FormikProps } from "formik";
import { api } from "../../../core/api";
import { DateTime } from "luxon";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useSetRecoilState } from "recoil";
import { addTransactionInState, groupTransactionContainers } from "../../../state/transactions";
import { Group, Account } from "@abrechnung/types";
import AccountSelect from "../../style/AccountSelect";
import * as yup from "yup";

interface FormValues {
    value: string;
    description: string;
    billedAt: DateTime;
    creditor: Account;
    debitor: Account;
}

const validationSchema = yup.object({
    value: yup.number().required("value is required"),
    description: yup.string().required("description is required"),
    creditor: yup.object().required("from is required"),
    debitor: yup.object().required("to is required"),
    // billedAt: yup.date("Enter a description").required("from is required"),
});

interface Props {
    group: Group;
    show: boolean;
    onClose: (
        event: Record<string, never>,
        reason: "escapeKeyDown" | "backdropClick" | "completed" | "closeButton"
    ) => void;
}

export const TransferCreateModal: React.FC<Props> = ({ group, show, onClose }) => {
    const setTransactions = useSetRecoilState(groupTransactionContainers(group.id));

    const handleSubmit = (values, { setSubmitting }) => {
        api.createTransaction(
            group.id,
            "transfer",
            values.description,
            parseFloat(values.value),
            values.billedAt.toJSDate(),
            group.currencySymbol,
            1.0,
            { [values.creditor.id]: 1.0 },
            { [values.debitor.id]: 1.0 },
            true
        )
            .then((t) => {
                addTransactionInState(t, setTransactions);
                setSubmitting(false);
                onClose({}, "completed");
            })
            .catch((err) => {
                toast.error(err);
                setSubmitting(false);
            });
    };

    return (
        <Dialog open={show} onClose={onClose}>
            <DialogTitle>Create Transfer</DialogTitle>
            <DialogContent>
                <Formik
                    initialValues={{
                        description: "",
                        value: "0.0",
                        billedAt: DateTime.now(),
                        creditor: undefined,
                        debitor: undefined,
                    }}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}
                >
                    {({
                        values,
                        errors,
                        touched,
                        setFieldValue,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }: FormikProps<FormValues>) => (
                        <Form>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                variant="standard"
                                name="description"
                                label="Description"
                                autoFocus
                                value={values.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.description && Boolean(errors.description)}
                                helperText={touched.description && (errors.description as ReactNode)}
                            />
                            <DatePicker
                                inputFormat="yyyy-MM-dd"
                                renderInput={(params) => (
                                    <TextField
                                        name="billedAt"
                                        required
                                        variant="standard"
                                        fullWidth
                                        {...params}
                                        helperText={null}
                                    />
                                )}
                                label="Billed at"
                                value={values.billedAt}
                                onChange={(val) => setFieldValue("billedAt", val, true)}
                                // error={touched.billedAt && Boolean(errors.billedAt)}
                                // helperText={touched.billedAt && errors.billedAt}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                type="number"
                                inputProps={{ step: "any" }}
                                variant="standard"
                                name="value"
                                label="Value"
                                value={values.value}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.value && Boolean(errors.value)}
                                helperText={touched.value && (errors.value as ReactNode)}
                            />
                            <AccountSelect
                                label="From"
                                name="creditor"
                                group={group}
                                value={values.creditor}
                                onChange={(val) => setFieldValue("creditor", val, true)}
                                noDisabledStyling={true}
                                disabled={false}
                                error={touched.creditor && Boolean(errors.creditor)}
                                helperText={touched.creditor && (errors.creditor as string)}
                            />
                            <AccountSelect
                                label="To"
                                name="debitor"
                                group={group}
                                value={values.debitor}
                                onChange={(val) => setFieldValue("debitor", val, true)}
                                noDisabledStyling={true}
                                disabled={false}
                                error={touched.debitor && Boolean(errors.debitor)}
                                helperText={touched.debitor && (errors.debitor as string)}
                            />
                            {isSubmitting && <LinearProgress />}
                            <DialogActions>
                                <Button type="submit" color="primary" disabled={isSubmitting}>
                                    Save
                                </Button>
                                <Button color="error" onClick={() => onClose({}, "closeButton")}>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default TransferCreateModal;
