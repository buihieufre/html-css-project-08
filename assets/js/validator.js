

function Validator(options) {
    // Lưu lại các rule để sau đó ta xử lý lần lượt các rule áp dụng cho từng input
    var ruleSelector = {};
    const formElement = $(options.form);

    // Hàm dùng để validate các field, chỗ này ta sử lý các logic về validate
    function validate(formGroup, inputElement, rule) {
        var errorMessage = rule.test(inputElement.value);
        var errorMessageElement = formGroup.querySelector(options.formMessage);
        var rules = ruleSelector[rule.selector];

        for(func of rules){
            switch(inputElement.type){
                case "checkbox":
                case "radio":
                    errorMessage = func(formElement.querySelector(rule.selector  + ":checked"))
                    break;
                default:
                    errorMessage = func(inputElement.value)
            }
            if(errorMessage){
                break;
            }
        }
        // Thêm các text vào form-message
        if(errorMessageElement){
            if (errorMessage ) {
                formGroup.classList.add("invalid");
                errorMessageElement.innerText = errorMessage;
            } else {
                formGroup.classList.remove("invalid");
                errorMessageElement.innerText = "";
            }
        }
        return !errorMessage;
    }

    if (formElement) {
        // Lắng nghe sự kiện onsubmit của formElement
        formElement.onsubmit = function (e){
            e.preventDefault(); 
            var isValid = true;

            // Lặp qua các rule đồng thời validate các trường trước khi submit
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
                var formGroup = inputElement.closest(options.formGroup);
                isValid = validate(formGroup, inputElement, rule);
            })

            // Xử lý trả về dữ liệu cho hàm callback
            if(isValid){
                if(typeof options.onSubmit === "function"){
                    var enableInputs = formElement.querySelectorAll("[name]")
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch(input.type){
                            case "radio":
                                if (input.matches(":checked")){
                                    values[input.name] = input.value;
                                }else {
                                    return values;
                                }
                                break;
                            case "checkbox":
                                // if(!input.matches(":checked")) {
                                //     values[input.name] = [];
                                //     return values
                                // }
                                if(input.matches(":checked")){
                                    if(Array.isArray(values[input.name])){
                                        values[input.name].push(input.value)
                                    }else{
                                        values[input.name] = [input.value]
                                    }
                                }else{
                                    if(!values[input.name]){
                                        values[input.name] = "";
                                    }
                                }
                                break;
                            case "file":
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {})
                    options.onSubmit(formValues)
                }else{
                    formElement.submit()
                }
            }
        }
         
        //Lặp qua từng rule và lưu lại các rule vào ruleSelector
        options.rules.forEach((rule) => {
            if(Array.isArray(ruleSelector[rule.selector])){
                ruleSelector[rule.selector].push(rule.test);
            }else{
                ruleSelector[rule.selector] = [rule.test];
            }
            var inputElements = formElement.querySelectorAll(rule.selector);

            // Xử lý sự kiện người dùng và validate các input
            // Ở đây ta lặp qua các element
            Array.from(inputElements).forEach(function (inputElement){
                var formGroup = inputElement.closest(options.formGroup);
                inputElement.onblur = function () {
                    validate(formGroup, inputElement, rule);
                };
                inputElement.oninput = () => {
                    formGroup.classList.remove("invalid");
                };
            })
            
        });
    }
}

Validator.isRequired = function (selector) {
    // Nhận lại selector truyền vào làm đối sối của hàm, sau đó xử lý rồi trả lại
    // 
    // Ở đây thì trả về một object gồm selector và errorMessage
    // Ta có thể tùy biến thêm chẳng hạn như custom thêm errorMessage trả về chẳng hạn
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : "Vui lòng nhập trường này!";
        },
    };
};

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Vui lòng nhập đúng định dạng email";
        },
    };
};

Validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
        },
    };
};

Validator.isConfirmPassword = function (selector, getPassword, defaultMessage) {
    return {
        selector: selector,
        test: function (value) {
            return value === getPassword()
                ? undefined
                : defaultMessage || "Dữ liệu nhập lại không chính xác";
        },
    };
};

