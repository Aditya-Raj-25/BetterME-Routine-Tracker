import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

// TODO: Move this to a constants file later
const MIN_PASS_LENGTH = 6;

const SignUpScreen = ({ navigation }) => {
    // State for form fields
    const [name, setName] = useState('');
    const [pwd, setPwd] = useState('');
    const [pwd2, setPwd2] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [err, setErr] = useState('');

    const { signUp } = useAuth();
    const { theme } = useTheme();

    // Clear error when user types
    useEffect(() => {
        if (err) setErr('');
    }, [name, pwd, pwd2]);

    const onSignUpPress = async () => {
        // console.log('Sign up pressed', name); 

        // basic checks
        if (!name || !pwd || !pwd2) {
            setErr('Hey, you missed some fields!');
            return;
        }

        if (pwd !== pwd2) {
            setErr('Passwords don\'t match, please check.');
            return;
        }

        if (pwd.length < MIN_PASS_LENGTH) {
            setErr(`Password needs to be at least ${MIN_PASS_LENGTH} chars.`);
            return;
        }

        setIsLoading(true);

        try {
            await signUp(name, pwd);
            // navigation.navigate('Home'); // handled in context?
        } catch (e) {
            console.log("Signup error: ", e);
            setErr(e.response?.data?.message || 'Something went wrong. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: theme.background }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.mainContainer}>
                    <Text style={[styles.headerText, { color: theme.text }]}>Create Account</Text>
                    <Text style={{ fontSize: 16, color: theme.textSecondary, marginBottom: 30 }}>
                        Sign up to get started
                    </Text>

                    {err ? (
                        <Text style={{ color: theme.error, marginBottom: 15, textAlign: 'center' }}>
                            {err}
                        </Text>
                    ) : null}

                    <Input
                        label="Username"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        value={pwd}
                        onChangeText={setPwd}
                        secureTextEntry
                    />

                    <Input
                        label="Confirm Password"
                        value={pwd2}
                        onChangeText={setPwd2}
                        secureTextEntry
                    />

                    <Button
                        title="Sign Up"
                        onPress={onSignUpPress}
                        loading={isLoading}
                        style={{ marginTop: 20 }}
                    />

                    <Button
                        title="Already have an account? Sign In"
                        onPress={() => navigation.navigate('SignIn')}
                        type="text"
                        style={{ marginTop: 10 }}
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24
    },
    headerText: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8
    }
});

export default SignUpScreen;
