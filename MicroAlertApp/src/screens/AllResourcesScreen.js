import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import API from '../api/apiService';

export default function AllResources() {

    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await API.get('/resources');
        setData(res.data);
    };

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <View style={{ padding: 15, borderBottomWidth: 1 }}>
                    <Text>{item.title}</Text>
                    <Text>{item.type}</Text>
                    <Text>{item.contact}</Text>
                    <Text>{item.location}</Text>
                </View>
            )}
        />
    );
}