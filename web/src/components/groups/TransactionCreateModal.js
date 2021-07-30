import React from "react";
import {toast} from "react-toastify";
import {Field, Form, Formik} from "formik";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import {Select, TextField} from "formik-material-ui";
import {createTransaction} from "../../recoil/transactions";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";

export default function TransactionCreateModal({group, show, onClose}) {
    const handleSubmit = (values, {setSubmitting}) => {
        createTransaction({
            groupID: group.id,
            type: values.type,
            description: values.description,
            value: values.value,
            currencySymbol: "€",
            currencyConversionRate: 1.0
        })
            .then(result => {
                setSubmitting(false);
                onClose();
            })
            .catch(err => {
                toast.error(`${err}`);
                setSubmitting(false);
            })
    };

    return (
        <Dialog open={show} onClose={onClose}>
            <DialogTitle>Create Transaction</DialogTitle>
            <DialogContent>
                <Formik initialValues={{type: "purchase", description: "", value: "0.0"}} onSubmit={handleSubmit}>
                    {({handleSubmit, isSubmitting}) => (
                        <Form>
                            <FormControl>
                                <InputLabel>Type</InputLabel>
                                <Field
                                    margin="normal"
                                    required
                                    fullWidth
                                    autoFocus
                                    component={Select}
                                    name="type"
                                >
                                    <MenuItem value="purchase">Purchase</MenuItem>
                                    <MenuItem value="transfer">Transfer</MenuItem>
                                    <MenuItem value="mimo">MIMO</MenuItem>
                                </Field>
                            </FormControl>
                            <Field
                                margin="normal"
                                required
                                fullWidth
                                component={TextField}
                                name="description"
                                label="Description"
                            />
                            <Field
                                margin="normal"
                                required
                                fullWidth
                                type="number"
                                component={TextField}
                                name="value"
                                label="Value"
                            />
                            {isSubmitting && <LinearProgress/>}
                            <DialogActions>
                                <Button color="secondary" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    onClick={handleSubmit}
                                >
                                    Save
                                </Button>
                            </DialogActions>
                        </Form>)}
                </Formik>
            </DialogContent>
        </Dialog>
    )
}