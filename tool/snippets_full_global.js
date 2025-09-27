const { handleSwiftCreation, handleObjcCreation } = window.TriggeringSnippets;
const { buildDecleration, buildTest } = window.BuildDeclerationsAndTest;




(function(){
  // ----- Canonical key helper -----
  function key(lang, 
              method, 
              creation, 
              selector, 
              ret, 
              num, 
              ptypes, 
              trigger,
              impMethod) {
    return [lang, method, creation, selector, ret, num, ptypes, trigger, impMethod].join('|');
  }

  // ----- Enumerations (must match the UI) -----
  const ENUMS = {
    languages: ['objc','swift'],
    methods: ['class','instance'],
    creationsByMethod: {
      class: ['NSClassFromString','objc_getClass'],
      instance: ['instanceInput'] // free text in UI, represented as this literal in the key
    },
    selectorsByLang: {
      objc: ['NSSelectorFromString','@selector','sel_registerName'],
      swift: ['Selector','#selector']
    },
    returns: ['void','NSObject','BOOL','int','float','double'],
    numParams: ['none','one','two','threePlus'],
    paramTypesFor(num){ return num === 'none' ? ['none'] : ['allNSObject','oneCType']; },
    triggersByLang: {
      objc: ['performSelector','NSInvocation','IMPmethodForSelection', 'IMPmethod_getImpl', 'objc_msgSend'],
      swift: ['perform','IMP'] 
    }
  };

  // ----- Utility helpers you can use inside getSnippet -----
  function defaultInstanceText(lang){
    return lang === 'swift' ? 'let myInstance = MyClass();;' : 'id myInstance = [MyClass new];';
  }


  function selExpr(lang, selectorChoice, methodSignature){
      if (lang === 'swift') {
        if (selectorChoice === '#selector') {
          return `let mySelector = #selector(${methodSignature}) // or #selector(ClassName.${methodSignature})`;
        }
        if (selectorChoice === 'Selector') {
          return `let mySelector = Selector("${methodSignature}")`;
        }
        if (selectorChoice === 'NSSelectorFromString') {
          return `let mySelector = NSSelectorFromString("${methodSignature}")`;
        }
        return `let mySelector = sel_registerName("${methodSignature}")`;
      } else {
        if (selectorChoice === '@selector') {
          const answer = `SEL mySelector = @selector(${methodSignature});`;
          return answer;
        }
        if (selectorChoice === 'sel_registerName') {
          return `SEL mySelector = sel_registerName("${methodSignature}");`;
        }
        return `SEL mySelector = NSSelectorFromString(@"${methodSignature}");`;
      }
    }
  


  function classExpr(lang, method, creationChoice){

    if (lang === 'swift') {
      if (method == 'instance') {
        return 'let myInstance = MyClass()'
      }
      else {
       if (creationChoice === 'NSClassFromString') {
          return 'let myClass = NSClassFromString("ClassName")'
        }
        else {
          return 'let myClass = objc_getClass("ClassName")'
        }
      }


    } else {

      if (method == 'instance') {
        return 'id myInstance = [MyClass new];'
      }
      else {
       if (creationChoice === 'NSClassFromString') {
          return 'id myClass = NSClassFromString("ClassName");'
        }
        else {
          return 'id myClass = objc_getClass("ClassName");'
        }
      }
    }
  }

  function implementationCode(lang, method, ret, num, ptypes, trigger, impType) {

    var target = "myClass"
    if (method === 'instance') target = "myInstance"
    if (lang === 'swift') {
      return handleSwiftCreation(target, ret, num, ptypes, trigger, impType)
    }
    return handleObjcCreation(target, ret, num, ptypes, trigger, impType)

  }


  // EDIT THIS: the single function that returns the snippet string
  function getSnippet(lang, method, creation, selectorChoice, ret, num, ptypes, trigger, impType){
    
    // You can customize the generated code below using the parameters.
    // Simple starter logic is provided. Replace/extend as you wish.
    
    const class_creation_line = classExpr(lang, method, creation);
    const signature = selectorSignature(num, ptypes)
    const sel = selExpr(lang, selectorChoice, signature);
    const implementation = implementationCode(lang, method, ret, num, ptypes, trigger, impType)

    var reply = ""
    reply += class_creation_line + '\n'
    reply += sel + '\n'
    reply += implementation + '\n'

    return reply

  }


  // EDIT THIS: the single function that returns the decleration string
  function getDecleration(lang, method, creation, selectorChoice, ret, num, ptypes, trigger, impType){
    
    // You can customize the generated code below using the parameters.
    // Simple starter logic is provided. Replace/extend as you wish.
    
    const comment = "// Objc callee function decleration:"
    const decleration = buildDecleration(method, ret, num, ptypes);
    const testComment = "// Dummy implementation for testing"
    const testImplementation = buildTest(method, ret, num, ptypes);

    var reply = ""
    reply += comment + '\n';
    reply += decleration + '\n\n';
    reply += testComment + '\n';
    reply += testImplementation;

    return reply;

  }

  // Map UI labels to our internal enum values (back-compat + HTML differences)
  function normalizeParts(parts) {
    // parts: [lang, method, creation, selector, ret, num, ptypes, trigger]
    const [lang, method, creation, selector, ret, num, ptypes, trigger, impType] = parts;

    // Trigger aliases from the HTML:
    // HTML uses: "IMP methodForSelector" and "IMP method_getImplementation"
    // Internally we collapse both to "IMP"
    const triggerNorm = trigger 
    /*
      (trigger === 'IMPmethodForSel' || trigger === 'IMP methodForSelector' ||
       trigger === 'IMPmethod_getImpl' || trigger === 'IMP method_getImplementation')
        ? 'IMP'
        : trigger;
    */

    // Swift selectors: allow NSSelectorFromString / sel_registerName (UI provides these)
    // ObjC selectors are already handled in selExpr; this just passes values through.

    // Creation for instance is free-text in UI → represented as "instanceInput"
    const creationNorm = (method === 'instance') ? 'instanceInput' : creation;

    return [lang, method, creationNorm, selector, ret, num, ptypes, triggerNorm, impType];
  }

 function getSnippetByKey(k){
    const parts = normalizeParts(k.split('|'));
    return getSnippet(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], parts[8]);
  }

   function getDeclerationByKey(k){
    const parts = normalizeParts(k.split('|'));
    return getDecleration(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7], parts[8]);
  }

  function selectorSignature(num, ptypes) {
     if (num === 'none') return 'methodName'
     if (num === 'one') return 'methodNameWith:'
     if (num === 'two') return 'methodNameWith:and:'
     return 'methodNameWith:and:and:'
  }

  // Expose in global namespace
    window.Snippets = { key, getSnippet, getSnippetByKey, getDeclerationByKey };

})();