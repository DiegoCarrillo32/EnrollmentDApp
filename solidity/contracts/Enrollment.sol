// SPDX-License-Identifier: unlicensed

pragma solidity ^0.8.0;

contract Enroll {
    
    struct Class {
        string className;
        address teacher;
        uint enrollmentCost;
    }
    struct Member {
        string name;
        address memberAddress;
    }

    event Enrolled(address indexed student, string className);

    

    address public administrator;
    //used to retrieve all classes
    Class[] public classes;
    // student enrolled courses
    mapping (address => Class[]) public studentClasses;
    //used to fast access an specific class and not iterate over all classes
    mapping (string => Class) public instituteClasses;
    // students from a specific class 
    mapping (string => Member[]) public classStudents;
    
    
    constructor (){
        administrator = msg.sender;
    }

    function compareString(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function addClass(string memory _className, address _teacher, uint enrollmentCost) public {
        require(msg.sender == administrator, "Only administrator can create classes");
        string memory className = instituteClasses[_className].className;
        if(compareString(_className, className)){
            return;
        }
        
        instituteClasses[_className] = Class(_className, _teacher, enrollmentCost);
        classes.push(Class(_className, _teacher, enrollmentCost));
    }

    function addStudentToClass(string memory _studentName, address _studentAddress, string memory _className ) public payable{
        require(msg.value == instituteClasses[_className].enrollmentCost, "Have to pay full price to enroll " );
        
        address payable _to = payable(administrator);
        emit Enrolled(_studentAddress, _className);
         _to.transfer(msg.value);
        
        studentClasses[_studentAddress].push(instituteClasses[_className]);
        classStudents[_className].push(Member(_studentName, _studentAddress)); 
    }

    function getAllClasses() public view returns (Class[] memory){
        return classes;
    }
    
    function getClassStudents(string memory _className) public view returns(Member[] memory){
        return classStudents[_className];
    }

    function getStudentEnrolls(address _studentAddress) public view returns (Class[] memory ){
        return studentClasses[_studentAddress];
    }

    function getAdministratorBalance() public view returns (uint) {
        return administrator.balance / 10**18;
    }
}
