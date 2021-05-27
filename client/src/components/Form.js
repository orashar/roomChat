import React from 'react'

/**
* @author
* @function Form
**/

const Form = (props) => {
  return(
    <form>
        <input
            placeholder="Username"
            type="text"
            value={props.username}
            onChange={props.onChange}
        />
        <button onClick={props.connect}>Connect</button>
    </form>
   )

 }

export default Form