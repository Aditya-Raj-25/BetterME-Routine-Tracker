import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import client from '../../api/client';

const CATS = ['Health', 'Study', 'Work', 'Personal'];
const TYPES = ['count', 'time'];

const AddHabitScreen = ({ navigation }) => {
    const { theme } = useTheme();

    // form state
    const [name, setName] = useState('');
    const [cat, setCat] = useState('Personal');
    const [type, setType] = useState('count');
    const [val, setVal] = useState('1');

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const saveHabit = async () => {
        if (!name) {
            setErr('Name is required');
            return;
        }

        setLoading(true);
        setErr('');

        try {
            await client.post('/habits', {
                name,
                category: cat,
                targetType: type,
                targetValue: parseInt(val) || 1
            });
            // go back on success
            navigation.goBack();
        } catch (e) {
            setErr('Something went wrong');
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={styles.header}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>New Habit</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: theme.primary, fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
                {err ? <Text style={{ color: theme.error, textAlign: 'center', marginBottom: 10 }}>{err}</Text> : null}

                <Input
                    label="Habit Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Drink Water"
                />

                <Text style={{ marginBottom: 8, fontWeight: '600', color: theme.text }}>Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                    {CATS.map(c => (
                        <TouchableOpacity
                            key={c}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: cat === c ? theme.primary : theme.surface,
                                    borderColor: theme.border
                                }
                            ]}
                            onPress={() => setCat(c)}
                        >
                            <Text style={{ color: cat === c ? '#FFF' : theme.text }}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={{ marginBottom: 8, fontWeight: '600', color: theme.text }}>Type</Text>
                <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                    {TYPES.map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: type === t ? theme.primary : theme.surface,
                                    borderColor: theme.border
                                }
                            ]}
                            onPress={() => setType(t)}
                        >
                            <Text style={{ color: type === t ? '#FFF' : theme.text }}>
                                {t === 'time' ? 'Time' : 'Count'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Input
                    label={type === 'time' ? 'Minutes' : 'Times'}
                    value={val}
                    onChangeText={setVal}
                    keyboardType="numeric"
                />

                <Button
                    title="Save"
                    onPress={saveHabit}
                    loading={loading}
                    style={{ marginTop: 20 }}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    }
});

export default AddHabitScreen;
