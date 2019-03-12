
function Validation(){
    // Validation requires that input is not null
    this.validStr = function(input){
        if (input){
            return true;
        }
        return false;
    };
    // Validation requires that input is a number greater than 0 - accepts floats
    this.validNum = function(input){
        if (isNaN(input) === false && input > 0){
            return true;
        }
        return false;
    };
    // Validation requires that input is an integer greater than 0
    this.validInt = function(input){
        if (isNaN(input) === false && input > 0 && parseFloat(input) === parseInt(input)){
            return true;
        }
        return false;
    };
}

module.exports = Validation;