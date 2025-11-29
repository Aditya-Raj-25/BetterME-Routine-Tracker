import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

const SignInScreen = ({ navigation }) => {
    const [usr, setUsr] = useState('');
    const [pwd, setPwd] = useState('');
    const [busy, setBusy] = useState(false);

    const { signIn } = useAuth();
    const { theme } = useTheme();

    const submit = async () => {
        if (!usr || !pwd) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setBusy(true);

        try {
            // console.log('logging in...');
            await signIn(usr, pwd);
        } catch (err) {
            console.log(err);
            Alert.alert('Login Failed', err.response?.data?.message || 'Check your credentials');
        } finally {
            setBusy(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: theme.background }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: theme.text }}>
                        Welcome Back
                    </Text>
                    <Text style={{ fontSize: 16, color: theme.textSecondary, marginBottom: 30 }}>
                        Sign in to continue
                    </Text>

                    <Input
                        label="Username"
                        value={usr}
                        onChangeText={setUsr}
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        value={pwd}
                        onChangeText={setPwd}
                        secureTextEntry
                    />

                    <Button
                        title="Sign In"
                        onPress={submit}
                        loading={busy}
                        style={{ marginTop: 20 }}
                    />

                    <Button
                        title="Don't have an account? Sign Up"
                        onPress={() => navigation.navigate('SignUp')}
                        type="text"
                        style={{ marginTop: 10 }}
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default SignInScreen;
