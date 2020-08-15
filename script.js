//For Budget
var budgetController = (function(){

    var Expense = function(id, desc, value){
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, desc, value){
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var calculateTotal = function(type){

        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return{
        addItem: function(type,desc,value){
            var newItem, ID;
            
            //Create new ID
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            else
                ID = 0;
            
            //Create new item based on "type"
            if(type=="exp")
                newItem = new Expense(ID, desc, value);
            else if(type=="inc")
                newItem = new Income(ID, desc, value);
            
            //Push it into Data Structure
            data.allItems[type].push(newItem);
            //returning the new Element
            return newItem;
        },

        deleteItem: function(type,id){

            var ids,index;
            ids = data.allItems[type].map(function(curr){
                return curr.id;
            });

            index = ids.indexOf(id);

            if(index>-1){
                data.allItems[type].splice(index,1);
            }
        },

        calculateBudget: function(){

            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of income from expenses
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;
        },

        calculatePercentage: function(){
            
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                percent: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },

        testing: function(){
            console.log(data);
        }
    };

})();

//For UI
var UIcontroller = (function(){

    var DOMstrings = {
        inputType: ".addType",
        inputDesc: ".addDesc",
        inputValue: ".addValue",
        inputButton: ".addBtn",
        incomeContainer: ".incomeList",
        expenseContainer: ".expenseList",
        budgetLabel: ".budgetValue",
        incomeLabel: ".incomeValue",
        expenseLabel: ".expenseValue",
        percentageLabel: ".expensePercentage",
        container: ".container",
        expensesPercentageLabel: ".expPercent",
        dateLabel: ".date"
    };

    var nodeListForEach = function(list,callback){
        for(var i=0; i<list.length; i++){
            callback(list[i],i);
        }
    };

    return{
        getinput: function(){
            return{
            
                type: document.querySelector(DOMstrings.inputType).value, //income or expenditure
                desc: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj,type){
            var HTML,newHTML,element;
            
            //Create HTML string with placeholder text
            if(type=='inc'){
                element = DOMstrings.incomeContainer;
                HTML = '<tr id="inc-%id%"><td>%description%</td><td>%value%</td><td><button class="btn btn-outline-danger btn-sm">Delete</button></td></tr>';
            }else{
                element = DOMstrings.expenseContainer;
                HTML = '<tr id="exp-%id%"><td>%description%</td><td>%value%</td><td class="expPercent">%percent%</td><td><button class="btn btn-outline-danger btn-sm">Delete</button></td></tr>';
            }
            
            //Replcace the placeholder text with some actual data
            newHTML = HTML.replace('%id%',obj.id);
            newHTML = newHTML.replace('%description%',obj.desc);
            newHTML = newHTML.replace('%value%',obj.value);
            
            //Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields,fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDesc + ', '+DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;

            if(obj.percent > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percent+"%";
            else
                document.querySelector(DOMstrings.percentageLabel).textContent = "--%";
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields,function(current,index){
                
                if(percentages[index]>0)
                    current.textContent=percentages[index] + '%';
                else
                    current.textContent="--%";
            });
        },

        displayMonth: function(){
            var now,year,month,months,date;
            now = new Date();
            months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] +" "+year;

             
        },

        // formatNumber: function(num,type){
        // },

        getDOMstrings: function(){
            return DOMstrings;
        }
    }

})();

//For APP
var appController = (function(budgetCtrl,UIctrl){

    var setupEventListners = function(){

        var DOMstrings = UIctrl.getDOMstrings();
        
        document.querySelector(DOMstrings.inputButton).addEventListener("click",ctrlAddItem);
        
        document.addEventListener("keypress",function(event){
            if(event.key=="Enter")
                ctrlAddItem();
        });

        document.querySelector(DOMstrings.container).addEventListener("click",ctrlDeleteItem);
    };

    var updateBudget = function(){
        //  1. Calculate Budget
        budgetCtrl.calculateBudget();
        //  2. Return Budget
        var budget = budgetCtrl.getBudget();
        //  3. Display Budget on UI
        UIctrl.displayBudget(budget);
    };

    var updatePercentages = function(){

        //  1. Calculate Percentages
        budgetCtrl.calculatePercentage();
        //  2. Read percentages from budger controller
        var percentages = budgetCtrl.getPercentages();
        //  3. Update UI with New Percentages
        UIctrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        
        //  1. Get Feild input data
        var input = UIctrl.getinput();

        if(input.desc!="" &&!isNaN(input.value) && input.value>0){
            //  2. Add the item to Budget Controller
            var newItem = budgetController.addItem(input.type, input.desc, input.value);
            //  3. Add item to UI
            UIctrl.addListItem(newItem,input.type);
            //  4. Clear the Fields
            UIctrl.clearFields();
            //  5. Calculate and update Budget
            updateBudget();
            //  6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID,type,ID;
        itemID = event.target.parentNode.parentNode.id;

        if(itemID){
            splitID=itemID.split('-');
            type=splitID[0];
            ID=parseInt(splitID[1]);

            //  1. Delete item from Datastructure
            budgetCtrl.deleteItem(type,ID);
            //  2. Delete item from UI
            UIctrl.deleteListItem(itemID);
            //  3. Update and show the new Budget
            updateBudget();
            //  4. Calculate and update percentages
            updatePercentages();
        }
    };

    return{
        init: function(){
            console.log("Application has started...");
            setupEventListners();
            UIctrl.displayMonth();
        }
    };

})(budgetController,UIcontroller);

appController.init();