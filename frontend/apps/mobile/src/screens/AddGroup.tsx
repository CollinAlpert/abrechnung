import { createGroup } from "@abrechnung/redux";
import { GroupValidator } from "@abrechnung/types";
import { toFormikValidationSchema } from "@abrechnung/utils";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Checkbox, HelperText, ProgressBar, TextInput, useTheme } from "react-native-paper";
import { CurrencySelect } from "../components/CurrencySelect";
import { api } from "../core/api";
import { GroupStackScreenProps } from "../navigation/types";
import { useAppDispatch } from "../store";

export const AddGroup: React.FC<GroupStackScreenProps<"AddGroup">> = ({ navigation }) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            currencySymbol: "€",
            terms: "",
            addUserAccountOnJoin: false,
        },
        validationSchema: toFormikValidationSchema(GroupValidator),
        onSubmit: (values, { setSubmitting }) => {
            setSubmitting(true);
            dispatch(createGroup({ api, group: values }))
                .unwrap()
                .then(() => {
                    setSubmitting(false);
                    navigation.pop(1);
                })
                .catch(() => {
                    setSubmitting(false);
                });
        },
    });

    const cancel = React.useCallback(() => {
        formik.resetForm();
        navigation.pop(1);
    }, [formik, navigation]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            onGoBack: cancel,
            headerRight: () => {
                return (
                    <>
                        <Button onPress={cancel} textColor={theme.colors.error}>
                            Cancel
                        </Button>
                        <Button onPress={formik.handleSubmit}>Save</Button>
                    </>
                );
            },
        });
    }, [theme, navigation, formik, cancel]);

    return (
        <View style={styles.container}>
            {formik.isSubmitting ? <ProgressBar indeterminate /> : null}
            <TextInput
                label="Name"
                value={formik.values.name}
                style={styles.input}
                onChangeText={(val) => formik.setFieldValue("name", val)}
                error={formik.touched.name && !!formik.errors.name}
            />
            {formik.touched.name && !!formik.errors.name ? (
                <HelperText type="error">{formik.errors.name}</HelperText>
            ) : null}
            <TextInput
                label="Description"
                value={formik.values.description}
                style={styles.input}
                onChangeText={(val) => formik.setFieldValue("description", val)}
                error={formik.touched.description && !!formik.errors.description}
            />
            {formik.touched.description && !!formik.errors.description ? (
                <HelperText type="error">{formik.errors.description}</HelperText>
            ) : null}
            <TextInput
                label="Terms"
                value={formik.values.terms}
                style={styles.input}
                multiline={true}
                onChangeText={(val) => formik.setFieldValue("terms", val)}
                error={formik.touched.terms && !!formik.errors.terms}
            />
            {formik.touched.terms && !!formik.errors.terms ? (
                <HelperText type="error">{formik.errors.terms}</HelperText>
            ) : null}
            <CurrencySelect
                label="Currency"
                value={formik.values.currencySymbol}
                onChange={(val) => formik.setFieldValue("currencySymbol", val)}
                // error={formik.touched.description && !!formik.errors.currencySymbol}
            />
            {formik.touched.currencySymbol && !!formik.errors.description ? (
                <HelperText type="error">{formik.errors.currencySymbol}</HelperText>
            ) : null}
            <Checkbox.Item
                label="Add user accounts on join"
                status={formik.values.addUserAccountOnJoin ? "checked" : "unchecked"}
                style={styles.input}
                onPress={() => formik.setFieldValue("addUserAccountOnJoin", !formik.values.addUserAccountOnJoin)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 6,
    },
    input: {
        marginBottom: 4,
    },
});
