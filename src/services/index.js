import axios from 'axios';

const fetchCustomerData = async () => {
    const response = await axios.get('https://jsonplaceholder.typicode.com/users');
    if(response.status === 200) {
        return {
            data: response.data,
            code: response.code,
            message: response.message
        };
    } else {
        return {
            data: null,
            code: response.code,
            message: response.message
        }
    }
    
}

export {fetchCustomerData}