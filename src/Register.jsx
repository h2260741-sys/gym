import React,{useState,useEffect, use} from 'react'
import { useNavigate } from 'react-router-dom'
import './Register.css'

function Register() {
    const navigate = useNavigate()


    const[formdata,setFormdata]=useState({
        choosefile:"",
        name:"",
        phone:"",
        joiningdate:"",
        expiredwithin:"",
        expired:""
    });

    const[users,setUsers]=useState([]);

    useEffect(()=>{
        const storedusers=JSON.parse(localStorage.getItem("users")) || [];
        setUsers(storedusers);
    },[]);

    const handleChange=(e)=>{
        const {name, value} = e.target;
        setFormdata({...formdata,[name]:value});
    };
    const handleSubmit=(e)=>{
        e.preventDefault();

        const updatedusers=[...users,formdata];

        localStorage.setItem("users",JSON.stringify(updatedusers));
        setUsers(updatedusers);

        setFormdata({ choosefile:"", name:"",phone:"",joiningdate:"",expiredwithin:"",expired:""});
    }

    const handleBack = () => {
        navigate('/Details')
    }



  return (
    <>
     <div className="form-parent">
        <div className="Form-Child">
            <h1 className='Register-form'>Register Form</h1>
            <form className='Form' onSubmit={handleSubmit}>
                <input type="file" name="choosefile" placeholder='Choose File' className='Input' onChange={handleChange}/>
                <input type="text" name="name" placeholder='enter your name' className='Input' value={formdata.name} onChange={handleChange}/>
                <input type="tel" name="phone" placeholder='Phone Number' className='Input' value={formdata.phone} onChange={handleChange}/>
                <input type="date" name="joiningdate" placeholder='joining date' className='Input' value={formdata.joiningdate} onChange={handleChange}/>
                <input type="number" name="expiredwithin" placeholder='expired within' className='Input' value={formdata.expiredwithin} onChange={handleChange}/>
                <input type="date" name="expired" placeholder='expired' className='Input' value={formdata.expired} onChange={handleChange}/>
                <div className="brs-parent">
                <button type="button" onClick={handleBack}><i className="fa-solid fa-circle-arrow-left"></i>Back</button>
                <button type="button" onClick={() => setFormdata({ choosefile:"", name:"",phone:"",joiningdate:"",expiredwithin:"",expired:""})}>Reset</button>
                <button type="submit">Submit</button>
                </div>
            </form>
            
        </div>
    </div>

    </>
  )
}

export default Register