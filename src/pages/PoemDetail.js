import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const PoemDetail = () => {
    const { id } = useParams();

    useEffect(() => {

    }, []);

    return (
        <>Hello detail {id}</>
    )
}

export default PoemDetail;
