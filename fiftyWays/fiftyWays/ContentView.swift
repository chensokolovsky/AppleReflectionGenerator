//
//  ContentView.swift
//  fiftyWays
//
//  Created by chenshalev on 19/09/2025.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 40) {
            Text("Use the tool to generate code.\nThen tap the buttons below and follow the console logs. See README for more details.")

            Button("Trigger ObjC call") {ObjCCaller.call()}
            Button("Trigger Swift call") {SwiftCaller.call()}
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
