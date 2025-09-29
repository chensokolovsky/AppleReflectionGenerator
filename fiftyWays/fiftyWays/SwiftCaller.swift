//
//  SwiftCaller.swift
//  fiftyWays
//
//  Created by chenshalev on 19/09/2025.
//

import Foundation

struct SwiftCaller {
    static func call() {
        print("Swift caller called")
        
        /// Paste your Swift calls here:
        let myInstance = MyClass()
        let mySelector = Selector("methodName")
        if let result = myInstance.perform(mySelector)?.takeUnretainedValue() as? NSObject {
            print("result: \(result)")
        }        
        
        print("Swift caller finished")
        
    }
}
