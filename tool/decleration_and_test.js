
(function (h) {


    function buildDeclerationLine(method, ret, num, ptypes) {
        /// this will be used with ; when declaring and with {} when implementing
        var decl = ''
        const pretype = method === 'class' ? '+' : '-'
        const rettype = getRetStringForRet(ret)
        const methodName = 'methodName'
        const params = getParams(num, ptypes)

        decl += pretype + rettype + ' ' + methodName + params;
        return decl;
    
    }


    function buildDecleration(method, ret, num, ptypes) {

        const declLine = buildDeclerationLine(method, ret, num, ptypes)
        const decl = declLine + ';';
        return decl;
    }

    function getRetStringForRet(ret) {
        if (ret === 'NSObject') return '(id)'
        return '(' + ret + ')'


    }
    
    function getParams(num, ptypes) {
       
        if (num === 'none') return ''
        if (num === 'one') return ptypes === 'allNSObject' ? 'With:(id)firstArg' : 'With:(float)firstParam'
        if (num === 'two') return ptypes === 'allNSObject' ? 'With:(id)firstArg and:(id)secondArg' : 'With:(float)firstArg and:(id)secondArg'
        return ptypes === 'allNSObject' ? 'With:(id)firstArg and:(id)secondArg and:(id)thirdArg' : 'With:(float)firstArg and:(id)secondArg and:(id)thirdArg'
    }

    function buildTest(method, ret, num, ptypes) {

        const declLine = buildDeclerationLine(method, ret, num, ptypes)
        const firstLine = declLine + ' {'

        const secondLine = buildSecondLine(num, ptypes)
        const closingLines = buildClosingLines(ret)

        return firstLine + '\n' + secondLine + '\n' + closingLines;
    }

    function buildSecondLine(num, ptypes) {
        if (num === 'none') return 'NSLog(@"method was triggered");'
        if (num === 'one') return ptypes === 'allNSObject' ? 'NSLog(@"triggered with arg: %@", firstArg);' : 'NSLog(@"triggered with arg: %f", firstArg);'
        if (num === 'two') return ptypes === 'allNSObject' ? 'NSLog(@"triggered with args: %@, %@", firstArg, secondArg);' : 'NSLog(@"triggered with arg: %f, %@", firstArg, secondArg);'
        return ptypes === 'allNSObject' ? 'NSLog(@"triggered with args: %@, %@, %@", firstArg, secondArg, thirdArg);' : 'NSLog(@"triggered with arg: %f, %@, %@", firstArg, secondArg, thirdArg);'
    }

    function buildClosingLines(ret) {
        if (ret === 'void') return '}'
        if (ret === 'NSObject') return 'return @"ack";\n}'
        if (ret === 'int') return 'return 44;\n}'
        if (ret === 'BOOL') return 'return YES;\n}'
        return 'return 0.95;\n}'
    }

 
  
  h.BuildDeclerationsAndTest = { buildDecleration, buildTest } ; // <-- expose

})(window);
