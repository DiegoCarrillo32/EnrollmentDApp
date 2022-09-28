import { utils, ethers, BigNumber } from 'ethers'
import abi from './contracts/Enroll.json';

import styles from './App.module.css';
import { useEffect, useState } from 'react';
import Container from './components/Container';
import { Form } from './components/Form';
import { useRef } from 'react';

function App() {
  const contractAddress = '0xBaA882f5dDc391FE8AD10F8b33Cda3956a72149c';
  const contractABI = abi.abi;
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [Classes, setClasses] = useState([])
  const [Enrolls, setEnrolls] = useState([])
  const [isBankerOwner, setIsBankerOwner] = useState(false);
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const formRef = useRef(null)
  const classRef = useRef(null)

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        console.log(window.ethereum, "ethereum");
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
        console.log(account);
        setIsWalletConnected(true)

      } else {
        console.log("Please install metamask");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getbankOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const enrollContract = new ethers.Contract(contractAddress, contractABI, signer)
        let owner = await enrollContract.administrator()
        setBankOwnerAddress(owner)
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
        console.log("dueño: ", owner, " conexion: ", account);

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsBankerOwner(true)
        }
      } else {
        console.log("Eth object not found");
      }
    } catch (error) {
      console.log(error);
    }
  }
  const handleSubmitCreateClass = async (e) => {
    e.preventDefault();

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const enrollContract = new ethers.Contract(contractAddress, contractABI, signer)
      const classname = e.target.classname.value;
      const teacheraddress = e.target.teacheraddress.value;
      const enrollmentCost = e.target.enrollment.value;
      console.log(classname, teacheraddress, enrollmentCost);
      const txn = await enrollContract.addClass(utils.formatBytes32String(classname), teacheraddress, ethers.utils.parseEther(enrollmentCost))
      await txn.wait()
    } else {
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(e.target.classname.value);
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const enrollContract = new ethers.Contract(contractAddress, contractABI, signer)
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const studentname = e.target.studentname.value;
      const classname = e.target.classname.value;
      const enrollcost = e.target.enrollcost.value;
      console.log(ethers.utils.parseEther(enrollcost));
      const txn = await enrollContract.addStudentToClass(utils.formatBytes32String(studentname), account, utils.formatBytes32String(classname), { value: ethers.utils.parseEther(enrollcost) });
      await txn.wait()
      getStudentEnrolls()
    } else {
    }
  }

  const getStudentEnrolls = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const enrollContract = new ethers.Contract(contractAddress, contractABI, signer)
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const enrolls = await enrollContract.getStudentEnrolls(account);
      console.log(enrolls);
      setEnrolls(enrolls)

    }
  }

  const getClasses = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const enrollContract = new ethers.Contract(contractAddress, contractABI, signer)
      const classes = await enrollContract.getAllClasses();
      console.log(classes);
      setClasses(classes);


    } else {

    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    getbankOwnerHandler()
    getStudentEnrolls()
    getClasses()

  }, [isWalletConnected])

  return (
    <div>
      {
        isBankerOwner ? (
          <Container>
            <h1>Hello {bankOwnerAddress}</h1>
            <Form ref={classRef} onSubmit={handleSubmitCreateClass}>
              <input
                placeholder='Class name'
                type="text"
                name="classname"
                id='class-input' />
              <input
                placeholder='Teacher address'
                type="text"
                name="teacheraddress"
                id='class-input' />
              <input
                placeholder='Enrollment cost eth'
                type="text"
                name="enrollment"
                id='class-input' />
              <button type='submit'>Create class</button>

            </Form>
          </Container>
        ) : (
          <Container>
            <div style={{
              display: 'flex',
              justifyContent: 'space-evenly',
              width: '100%',
            }}>

              <Form ref={formRef} onSubmit={handleSubmit}>
                <h2>Enroll to a class <b title='Write classname and enroll cost as displayed on the right to enroll' >(❓)</b> </h2>
                <input
                  placeholder='Student`s name '
                  type="text"
                  name="studentname"
                  id='class-input' />
                <input
                  placeholder='Class name as displayed on the right'
                  type="text"
                  name="classname"
                  id='class-input' />
                <input
                  placeholder='Enroll cost as displayed on the right'
                  type="text"
                  name="enrollcost"
                  id='class-input' />
                <button type='submit'>Enroll</button>

              </Form>
              <div>

                <h2>Available classes</h2>

                <div style={{
                  overflow: 'auto',


                }} >
                  {
                    Classes.map((item) => (
                      <div>
                        <b>Class name</b> - <b>Price</b> <br />

                        <p>{ethers.utils.parseBytes32String(item.className)} - {ethers.utils.formatEther(item.enrollmentCost)} ETH</p>

                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            <h2>Student enrolls</h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              {
                Enrolls.map((roll) => (
                  <>
                    <p style={{ margin: 0 }}> {ethers.utils.parseBytes32String(roll.className)} </p> -
                    <p style={{ margin: 0 }}> {ethers.utils.formatEther(roll.enrollmentCost)} ETH </p>
                  </>
                ))
              }
            </div>

          </Container>
        )
      }
    </div>

  );
}

export default App;
