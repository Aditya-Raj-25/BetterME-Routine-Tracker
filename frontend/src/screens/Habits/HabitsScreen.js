import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';
import Button from '../../components/Button';

const HabitsScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getHabits = async () => {
        try {
            const res = await client.get('/habits');
            setList(res.data);
        } catch (e) {
            console.log('Error getting habits', e);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            getHabits();
        }, [])
    );

    const onDelete = (id) => {
        Alert.alert(
            "Delete?",
            "You sure you want to remove this?",
            [
                { text: "Nah", style: "cancel" },
                {
                    text: "Yup",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await client.delete(`/habits/${id}`);
                            getHabits(); // refresh
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            ]
        );
    };

    const renderRow = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>{item.name}</Text>
                    <Text style={{ color: theme.textSecondary }}>{item.category}</Text>
                </View>
                <View style={{ backgroundColor: '#eef', padding: 5, borderRadius: 10 }}>
                    <Text style={{ color: theme.primary, fontSize: 12 }}>
                        {item.targetValue} {item.targetType === 'time' ? 'min' : 'x'}
                    </Text>
                </View>
            </View>

            <View style={{ alignItems: 'flex-end', borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 }}>
                <TouchableOpacity onPress={() => onDelete(item._id)}>
                    <Text style={{ color: theme.error }}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={styles.top}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>My Habits</Text>
                <Button
                    title="+ Add"
                    onPress={() => navigation.navigate('AddHabit')}
                    style={{ width: 80, height: 36 }}
                />
            </View>

            <FlatList
                data={list}
                renderItem={renderRow}
                keyExtractor={i => i._id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={getHabits} />
                }
                ListEmptyComponent={
                    !isLoading && (
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Text style={{ color: theme.textSecondary }}>Nothing here yet.</Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    }
});

export default HabitsScreen;
