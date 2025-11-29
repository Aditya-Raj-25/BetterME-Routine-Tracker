import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import client from '../../api/client';

const AddRoutineScreen = ({ navigation }) => {
    const { theme } = useTheme();

    const [name, setName] = useState('');
    const [allHabits, setAllHabits] = useState([]);
    const [selected, setSelected] = useState([]);

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        // load habits on mount
        const load = async () => {
            try {
                const res = await client.get('/habits');
                setAllHabits(res.data);
            } catch (e) {
                console.log(e);
            }
        };
        load();
    }, []);

    const toggle = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(x => x !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const create = async () => {
        if (!name) {
            setErr('Name missing');
            return;
        }

        if (selected.length === 0) {
            setErr('Pick at least one habit');
            return;
        }

        setLoading(true);
        setErr('');

        try {
            await client.post('/routines', {
                name,
                habits: selected
            });
            navigation.goBack();
        } catch (e) {
            setErr('Failed to create');
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={styles.head}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>New Routine</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: theme.primary, fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <View style={{ padding: 16, flex: 1 }}>
                {err ? <Text style={{ color: theme.error, textAlign: 'center', marginBottom: 10 }}>{err}</Text> : null}

                <Input
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Morning Routine"
                />

                <Text style={{ marginBottom: 10, fontWeight: '600', color: theme.text }}>Habits</Text>

                <FlatList
                    data={allHabits}
                    keyExtractor={item => item._id}
                    style={{ flex: 1, marginBottom: 20 }}
                    renderItem={({ item }) => {
                        const isSelected = selected.includes(item._id);
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.item,
                                    {
                                        backgroundColor: theme.surface,
                                        borderColor: isSelected ? theme.primary : theme.border
                                    }
                                ]}
                                onPress={() => toggle(item._id)}
                            >
                                <Text style={{ color: theme.text }}>{item.name}</Text>
                                {isSelected && (
                                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} />
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />

                <Button
                    title="Create"
                    onPress={create}
                    loading={loading}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    head: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    }
});

export default AddRoutineScreen;
