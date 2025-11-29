import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { format } from 'date-fns';

const HomeScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { user } = useAuth();

    // Data state
    const [myHabits, setMyHabits] = useState([]);
    const [dailyLogs, setDailyLogs] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const loadData = async () => {
        try {
            // console.log('Fetching home data...');
            const p1 = client.get('/habits');
            const p2 = client.get(`/habits/logs/${todayStr}`);

            const [res1, res2] = await Promise.all([p1, p2]);

            // Filter out inactive ones
            const active = res1.data.filter(h => h.isActive);
            setMyHabits(active);

            // Create a map for easier lookup
            const logMap = {};
            res2.data.forEach(l => {
                logMap[l.habit] = l;
            });
            setDailyLogs(logMap);

        } catch (e) {
            console.warn('Failed to load home data', e);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onToggle = async (habit) => {
        const currentLog = dailyLogs[habit._id];
        const newVal = currentLog ? !currentLog.completed : true;
        const newProgress = newVal ? habit.targetValue : 0;

        // Optimistic UI update
        setDailyLogs(prev => ({
            ...prev,
            [habit._id]: { ...prev[habit._id], completed: newVal, progress: newProgress }
        }));

        try {
            await client.post('/habits/log', {
                habitId: habit._id,
                date: todayStr,
                completed: newVal,
                progress: newProgress
            });
        } catch (error) {
            console.log('Toggle failed', error);
            // revert? nah just reload
            loadData();
        }
    };

    const renderHabitRow = ({ item }) => {
        const log = dailyLogs[item._id];
        const done = log?.completed;

        return (
            <TouchableOpacity
                style={[
                    styles.habitCard,
                    {
                        backgroundColor: done ? theme.primary : theme.surface,
                        borderColor: done ? theme.primary : theme.border
                    }
                ]}
                onPress={() => onToggle(item)}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[
                        styles.hName,
                        { color: done ? '#FFF' : theme.text }
                    ]}>
                        {item.name}
                    </Text>
                    <Text style={{ color: done ? 'rgba(255,255,255,0.8)' : theme.textSecondary, fontSize: 14 }}>
                        {item.targetValue} {item.targetType === 'time' ? 'min' : 'times'}
                    </Text>
                </View>

                <View style={[
                    styles.checkCircle,
                    {
                        borderColor: done ? '#FFF' : theme.border,
                        backgroundColor: done ? '#FFF' : 'transparent'
                    }
                ]}>
                    {done && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: theme.primary }} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={styles.topBar}>
                <View>
                    <Text style={{ fontSize: 16, color: theme.textSecondary, marginBottom: 4 }}>
                        Hello, {user?.username}
                    </Text>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text }}>
                        Today's Habits
                    </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primary }}>
                    {format(new Date(), 'MMM d')}
                </Text>
            </View>

            <FlatList
                data={myHabits}
                renderItem={renderHabitRow}
                keyExtractor={item => item._id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={loadData} />
                }
                ListEmptyComponent={
                    !isLoading && (
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Text style={{ color: theme.textSecondary }}>No active habits for today.</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Habits')}>
                                <Text style={{ color: theme.primary, marginTop: 8 }}>Manage Habits</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
    },
    habitCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // shadow stuff
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    hName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    }
});

export default HomeScreen;
