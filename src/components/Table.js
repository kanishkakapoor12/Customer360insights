import { useEffect, useState } from 'react';
import {Table} from 'antd';
import { fetchCustomerData } from '../services/index';
import '../style.css';

const TableComponent = () => {
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0), 
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.name.charCodeAt(0) - b.name.charCodeAt(0), 
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone'
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address'
        },
    ]
    const [users, setUsers] = useState([]);
    const [isError, setError] = useState(false);
    const fetchData = async () => {
        try {
            const usersData = await fetchCustomerData();
            const parsedData = usersData.data.map((item) => ({
                ...item, address: item.address.suite + ' ' + item.address.street + ' ' + item.address.city
            }))
            setUsers(parsedData)
        } catch(e) {
            console.error(e)
            setError(true);
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if(isError) return <div className='no-data'>No data</div>

    return <div>{users.length > 0 && <Table dataSource={users} columns={columns} showSorterTooltip={{ target: 'sorter-icon' }}/>}</div>
}

export default TableComponent;