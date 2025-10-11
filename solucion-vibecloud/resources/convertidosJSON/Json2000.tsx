import React from 'react'

const Json2000 = () => {
    // Fetch data from an API or a local JSON file
    function fetchData() {
        fetch('../../js/DatosJSON/json2000.json')
            .then(response => response.json())
            .then(data => {
                console.log(data)
            })
            .catch(error => {
                console.error('Error fetching JSON:', error)
            })
    }

    return (
        fetchData()
    )
}



export default Json2000
