import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';
import Heatmap from '../../components/Heatmap';

const StatsScreen = () => {
    const { theme } = useTheme();
    const [heatmap, setHeatmap] = useState({});
    const [streaks, setStreaks] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        try {
            // get both at once
            const [r1, r2] = await Promise.all([
                client.get('/stats/heatmap'),
                client.get('/stats/streaks')
            ]);
            setHeatmap(r1.data);
            setStreaks(r2.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [])
    );

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.background }}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refresh} />
            }
        >
            <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text }}>Progress</Text>
            </View>

            <View style={[styles.box, { backgroundColor: theme.surface }]}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>Activity Heatmap</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 10 }}>Last 3 months</Text>
                <Heatmap data={heatmap} />
            </View>

            <View style={[styles.box, { backgroundColor: theme.surface }]}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 15 }}>Streaks</Text>

                {streaks.length > 0 ? (
                    streaks.map((s) => (
                        <View key={s.habitId} style={styles.row}>
                            <Text style={{ flex: 1, fontSize: 16, fontWeight: '500', color: theme.text }}>{s.name}</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ alignItems: 'center', width: 60 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.primary }}>{s.currentStreak}</Text>
                                    <Text style={{ fontSize: 10, color: theme.textSecondary }}>CURR</Text>
                                </View>
                                <View style={{ width: 1, height: 20, backgroundColor: '#ddd', marginHorizontal: 5 }} />
                                <View style={{ alignItems: 'center', width: 60 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.secondary }}>{s.longestStreak}</Text>
                                    <Text style={{ fontSize: 10, color: theme.textSecondary }}>BEST</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: theme.textSecondary }}>No streaks yet. Get to work!</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    box: {
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    }
});

export default StatsScreen;
