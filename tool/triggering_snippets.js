
(function (g) {

    ////
    //// ObjC 
    ////
    function handleObjcCreation(target, ret, num, ptypes, trigger, impType) {

        if (trigger === 'performSelector') {
            if (num === 'threePlus') {
                return "TODO?"
            }

            const myRet = getObjCReturnType(ret)
            const myPerform = getObjCPerformSelectorUpToTwo(num, ptypes)
            return myRet + '[' + target + ' ' + myPerform

        }


        if (trigger === 'NSInvocation') {

            const invocationIntro = '\nNSMethodSignature *signature = [instance methodSignatureForSelector:mySelector];  \
                                    \nNSInvocation *invocation = [NSInvocation invocationWithMethodSignature:signature];   \
                                    \n[invocation setSelector:mySelector];   \
                                    \n[invocation setTarget:instance];'

            const args = getObjCInvocationArguments(num, ptypes)
            const assignment = getObjCInvocationAssignment(num)
            const invoke = '[invocation invoke];'
            const retVal = getObjCInvocationReturnVal(ret)


            return invocationIntro + '\n\n' + args + '\n' + assignment + '\n' + invoke + '\n\n' + retVal
        }

        if (trigger === 'IMP') {

            function obtainingImpForType(t) {
                if (t === 'methodForSel') {
                    return 'IMP myImpl = [myClass methodForSelector:mySelector];'
                }
                if (t === 'method_getImpl') {
                    if (target === 'myClass') {
                        return 'Method myMethod = class_getClassMethod(MyClass, mySelector); \
                                \nIMP myImpl = method_getImplementation(myMethod);'
                    }
                    return 'Method myMethod = class_getInstanceMethod(MyClass, mySelector);   \
                            \nIMP myImpl = methof_getImplementation(myMethod);'
                }
                return 'IMP myImpl = class_getMethodImplementation(myClass, mySelector);'
            }

            const getImpl = obtainingImpForType(impType)

            const triggeringPointer = createCFunctionPointer(ret, num, ptypes, '')
            const triggeringDecleration = createCFunctionPointer(ret, num, ptypes, 'myFunc')
            const fullDecleration = triggeringDecleration + ' = (' + triggeringPointer + ')myImpl;'

            const triggerLine = getObjCImplTriggerLine(target, ret, num, ptypes)

            return '\n' + getImpl + '\n' + fullDecleration + '\n' + triggerLine

        }


        if (trigger === 'objc_msgSend') {

            function oneliner(target, ret, num, ptypes) {
                const returnStatement = getObjCReturnType(ret)
                const funcPtr = createCFunctionPointer(ret, num, ptypes, '')

                var call = returnStatement + '((' + funcPtr + ') objc_msgSend)(' + target + ', mySelector'

                if (num === 'none') call += ');'
                else if (num === 'one') call += ptypes === 'allNSObject' ? ', @"myFirstArg");' : ', 0.99);'
                else if (num === 'two') call += ptypes === 'allNSObject' ? ', @"myFirstArg", @"mySecondArg");' : ', 0.99, @"mySecondArg");'
                else if (num === 'threePlus') call += ptypes === 'allNSObject' ? ', @"myFirstArg", @"mySecondArg", @"myThirdArg");' : ', 0.99, @"mySecondArg", @"myThirdArg");'

                return call

            }

            function twoliner(target, ret, num, ptypes) {

                var twoliner = "/* Alternatively if you don't like the one liner approach\n"
                
                const triggeringPointer = createCFunctionPointer(ret, num, ptypes, '')
                const triggeringDecleration = createCFunctionPointer(ret, num, ptypes, 'myFunc')
                const fullDecleration = triggeringDecleration + ' = (' + triggeringPointer + ')objc_msgSend;'
                
                const triggerLine = getObjCImplTriggerLine(target, ret, num, ptypes)

                twoliner += fullDecleration + '\n'
                twoliner += triggerLine + ' */'

                return twoliner

            }

            const oneLiner = oneliner(target, ret, num, ptypes)
            const twoLiner = twoliner(target, ret, num, ptypes)

            const full = oneLiner + '\n\n' + twoLiner


            return full


        }

        return 'TODOOOOO ' + target;
    }


    function getObjCImplTriggerLine(target, ret, num, ptypes) {
                
        var returnValueDef = ''
        if (ret === 'NSObject') {
            returnValueDef = '__unsafe_unretained id result = '
        } else if (ret === 'void') {} // keep empty
        else {
            returnValueDef = ret + ' result = '
        }


        var call = 'myFunc(' + target + ', mySelector'
        if (num === 'none') call += ');'
        else if (num === 'one') call += ptypes === 'allNSObject' ? ', @"myFirstArg");' : ', 0.99);'
        else if (num === 'two') call += ptypes === 'allNSObject' ? ', @"myFirstArg", @"mySecondArg");' : ', 0.99, @"mySecondArg");'
        else if (num === 'threePlus') call += ptypes === 'allNSObject' ? ', @"myFirstArg", @"mySecondArg", @"myThirdArg");' : ', 0.99, @"mySecondArg", @"myThirdArg");'

        return returnValueDef + call;

    }

    function createCFunctionPointer(ret, num, ptypes, declerationName) {

        function getCParams(num, ptypes) {
            if (num === 'none') return '(id, SEL)'
            if (num === 'one') return ptypes === 'allNSObject' ? '(id, SEL, id)' : '(id, SEL, float)'
            if (num === 'two') return ptypes === 'allNSObject' ? '(id, SEL, id, id)' : '(id, SEL, float, id)'
            if (num === 'threePlus') return ptypes === 'allNSObject' ? '(id, SEL, id, id, id)' : '(id, SEL, float, id, id)'
        }


        const retToUse = ret === 'NSObject' ? 'id' : ret
        const decleration = '(*' + declerationName + ')'
        const params = getCParams(num, ptypes)

        return retToUse + ' ' + decleration + ' ' + params

    }


    function numberOfArgs(c) {
        if (c === 'one') return 1
        if (c === 'two') return 2
        if (c === 'threePlus') return 3
    }

    function wordPerNumber(i) {
        if (i === 1) return 'first'
        if (i === 2) return 'second'
        if (i === 3) return 'third'
        return "ERROR!!!!!!!!!!!!!! unexpected arg number"
    }


    function getObjCInvocationArguments(num, ptypes) {

        if (num === 'none') return ''

       
        function capitalizeFirst(str) {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        function createArgForvalue(i, isNSObject) {
            const w = wordPerNumber(i)
            if (isNSObject) return 'id ' + w + 'Arg = @"my' + capitalizeFirst(w) + 'Arg";    // or any other NSObject'
            return 'float ' + w + 'Arg = 0.99;    // or any other c type'
        }

        const totalArgs = numberOfArgs(num)

        if (ptypes === 'allNSObject') {

            var argsDeclerations = ''
            for (let i = 1; i <= totalArgs; i++) {
                argsDeclerations += createArgForvalue(i, 1) + '\n'
            }

            return argsDeclerations

        }
        else {
            var argsDeclerations = ''
            argsDeclerations += createArgForvalue(1, 0) + '\n'
            for (let i = 2; i <= totalArgs; i++) {
                argsDeclerations += createArgForvalue(i, 1) + '\n'
            }
            return argsDeclerations
        }

    }

    function getObjCInvocationReturnVal(ret) {

        function createResultForType(ret) {
            if (ret === 'NSObject') return '__unsafe_unretained id result;'
            return ret + ' result;'
        }

        if (ret === 'void') return ''
        const resultInstance = createResultForType(ret)
        return resultInstance + '\n[invocation getReturnValue:&result];'
       
    }


    function getObjCInvocationAssignment(num, ptypes) {

        function createAssignmentForValue(i) {
            const w = wordPerNumber(i)
            var comment = ''
            if (i === 1) comment = '    // first arg is at index 2'
            return '[invocation setArgument:&' + w + 'Arg atIndex:' + (i + 1) + '];' + comment + '\n'

        }
        
        var argsAssignment = ''
        const totalArgs = numberOfArgs(num)
        for (let i = 1; i <= totalArgs; i++) {
            argsAssignment += createAssignmentForValue(i)
        }

        return argsAssignment

    }



     function getObjCReturnType(ret) {
        if (ret === 'void') return ''
        if (ret === 'NSObject') return 'id result = '
        if (ret === 'BOOL') return 'BOOL result = '
        if (ret === 'int') return 'int result = '
        if (ret === 'float') return 'float result = '
        if (ret === 'double') return 'double result = '
        return 'ERROR!!!! unexptected return type selected!!!!! Error number: 101'
    }

    function getObjCPerformSelectorUpToTwo(num, ptypes) {
        if (num === 'none') return 'performSelector:mySelector];'
        if (num === 'one') {
            if (ptypes === 'allNSObject') return 'performSelector:mySelector withObject:@"myFirstArg"];'
            return 'performSelector:mySelector withObject:0.99];'
        }
        if (num === 'two') {
            if (ptypes === 'allNSObject') return 'performSelector:mySelector withObject:@"myFirstArg" withObject:@"mySecondArg"];'
            return 'performSelector:mySelector withObject:0.99 withObject:@"mySecondArg"];'

        }
        return "ERROR!!!!! unexpected numer of args value up to two!!!!!!"
    }





  
    ////
    //// SWIFT 
    ////
    function handleSwiftCreation(target, ret, num, ptypes, trigger, impType) {

        if (trigger === 'perform') {
            if (num === 'threePlus') {
                return "Some error occured. you are not supposed to use 3 params with perform"
            }

            const myRet = getSwiftReturnVal(ret)
            const myPerform = getSwiftPerformSelectorUpToTwo(num)
            const unwrapper = getSwiftUnwrapper(ret)
            return myRet + target + myPerform + unwrapper

        }

        if (trigger === 'IMP') {

            // imp has 2 parts: obtaining the imp, and triggering the imp
            function obtainingTheImp(impT) {

                if (impT === 'methodForSel') {
                    return 'let myImpl: IMP = myClass.method(for: mySelector)'
                }
                if (impT === 'method_getImpl') {

                    if (target === 'myClass') {
                        return 'if let myMethod: Method = class_getClassMethod(myClass.self, mySelector) { \
	                    \nlet myImpl: IMP = method_getImplementation(myMethod)'
                    }
                    else {
                        return 'if let myMethod: Method = class_getInstanceMethod(MyClass.self, mySelector) { \
                        \nlet myImpl: IMP = method_getImplementation(myMethod)'
                    }
                    
                }
                return 'let myImpl: IMP = class_getMethodImplementation(myClass.self, mySelector)'

            }

            function generateTypeAliasLine(ret, num, ptypes) {

                const alias = 'typealias MyFunc = @convention(c) '
                const params = getSwiftArgForImp(num, ptypes)
                const returnValue = getSwiftReturnValue(ret)
                
                const firstLine = alias + params + returnValue
                return firstLine

            }

            function triggeringTheImp(target, ret, num, ptypes) {
                /*
                example:
                typealias MyMixedFunc = @convention(c) (AnyObject, Selector, NSObject, Float, NSObject) -> NSObject
                let funcPtrMixed = unsafeBitCast(myMixedImpl, to: MyMixedFunc.self)
                let mixedResult = funcPtrMixed(myInstance, myMixedSelector, "first param" as NSObject, 44.44, NSNumber(value: 0))
                */

                const firstLine = generateTypeAliasLine(ret, num, ptypes)
                
                const secondLine = 'let myFuncPtr = unsafeBitCast(myImpl, to: MyFunc.self)'

                const triggeringParams = getSwiftTriggeringParams(num, ptypes)
                const returnValue = getSwiftReturnVal(ret)
                const lineClosure = ret === 'none' ? '' : ' {...}'
                const thirdLine = returnValue + 'myFuncPtr(' + target + ', mySelector' + triggeringParams + lineClosure


                return firstLine + '\n' + secondLine + '\n' + thirdLine


            }

            const firstPart = obtainingTheImp(impType)
            const triggering = triggeringTheImp(target, ret, num, ptypes)
            const closure = impType === 'method_getImpl' ? '\n}' : ''

            return firstPart + '\n' + triggering + closure
        }


        return '*** swift for ' + target;
    }

    function getSwiftReturnVal(ret) {
        if (ret === 'void') return ''
        return 'if let result = '
    }
  

    function getSwiftTriggeringParams(num, ptypes) {

        if (num === 'none') return ')'
        if (num === 'one') return (ptypes === 'allNSObject') ? ', NSString("myFirstArg"))' : ', 4.44)'
        if (num === 'two') return (ptypes === 'allNSObject') ? ', NSString("myFirstArg"), NSString("mySecondArg"))' : ', 4.44, NSString("mySecondArg"))'
        return (ptypes === 'allNSObject') ? ', NSString("myFirstArg"), NSString("mySecondArg"), NSString("myThirdArg"))' : ', 4.44, NSString("mySecondArg"), NSString("myThirdArg"))'

    }
   
   function getSwiftUnwrapper(ret) {
        if (ret === 'void') return ''
        if (ret === 'NSObject') return '?.takeUnretainedValue() as? NSObject {...}'
        if (ret === 'BOOL') return ' as? Bool {...}'
        if (ret === 'int') return ' as? Int {...} '
        if (ret === 'float') return ' as? Float {...} '
        if (ret === 'double') return ' as? Double {...} '
        return ''
    }

    function getSwiftReturnValue(ret) {
        if (ret === 'void') return ' -> Void'
        if (ret === 'NSObject') return ' -> NSObject'
        if (ret === 'BOOL') return ' -> Bool'
        if (ret === 'int') return ' -> Int '
        if (ret === 'float') return ' -> Float '
        if (ret === 'double') return ' -> Double '
        return 'ERROR!!!! unexptected return type selected!!!!! Error number: 102'
    }

    function getSwiftPerformSelectorUpToTwo(num) {
        if (num === 'none') return '.perform(mySelector)'
        if (num === 'one') return '.perform(mySelector, with:NSString("myFirstArg"))'
        if (num === 'two') return '.perform(Selector:mySelector, with:NSString("myFirstArg"), with:NSString("mySecondArg"))'
        return "ERROR!!!!! unexpected numer of args value up to two!!!!!!"
    }
  
  
    function getSwiftArgForImp(num, ptypes) {
        var result = '(AnyObject, Selector'
        if (num === 'none') return result + ')'
        result += (ptypes === 'allNSObject') ? ', AnyObject' : ', Float'
        if (num === 'one') return result + ')'
        if (num === 'two') return result + ', AnyObject)'
        return result + ', AnyObject, AnyObject)'
    }



  
  
  g.TriggeringSnippets = { handleSwiftCreation, handleObjcCreation }; // <-- expose

})(window);
