"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Cell = {
  letter: string; // The correct letter (uppercase) or "" if black cell
  userLetter: string; // User's input
  number?: number; // Clue number if this cell starts a word
  isBlack: boolean;
};

type Clue = {
  number: number;
  text: string;
  row: number;
  col: number;
  direction: "across" | "down";
  length: number;
};

type Puzzle = {
  grid: Cell[][];
  clues: Clue[];
};

// Pre-built puzzles
const PUZZLES: Puzzle[] = [
  // Puzzle 1 - Simple themed puzzle
  {
    grid: [
      [
        { letter: "C", userLetter: "", number: 1, isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "D", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "W", userLetter: "", number: 2, isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "B", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "Y", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "M", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", number: 3, isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "Y", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "M", userLetter: "", number: 4, isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "Y", userLetter: "", number: 5, isBlack: false },
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "B", userLetter: "", number: 6, isBlack: false },
        { letter: "U", userLetter: "", isBlack: false },
      ],
      [
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "L", userLetter: "", number: 7, isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "G", userLetter: "", isBlack: false },
      ],
      [
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "X", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "", userLetter: "", isBlack: true },
        { letter: "D", userLetter: "", number: 8, isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "B", userLetter: "", isBlack: false },
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "G", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
    ],
    clues: [
      { number: 1, text: "Programming instructions", row: 0, col: 0, direction: "across", length: 4 },
      { number: 1, text: "Machine that processes data", row: 0, col: 0, direction: "down", length: 7 },
      { number: 2, text: "Internet pages", row: 0, col: 5, direction: "across", length: 3 },
      { number: 2, text: "Local network", row: 0, col: 5, direction: "down", length: 4 },
      { number: 3, text: "Organized data structure", row: 2, col: 4, direction: "across", length: 5 },
      { number: 4, text: "Pointing device", row: 4, col: 3, direction: "across", length: 5 },
      { number: 5, text: "Write on keyboard", row: 5, col: 1, direction: "across", length: 4 },
      { number: 6, text: "Software error", row: 5, col: 8, direction: "down", length: 4 },
      { number: 7, text: "Repeat control structure", row: 6, col: 4, direction: "across", length: 6 },
      { number: 8, text: "Find and fix errors", row: 8, col: 1, direction: "across", length: 5 },
    ],
  },
  // Puzzle 2
  {
    grid: [
      [
        { letter: "J", userLetter: "", number: 1, isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "V", userLetter: "", isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "H", userLetter: "", number: 2, isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "M", userLetter: "", isBlack: false },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "N", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "R", userLetter: "", number: 3, isBlack: false },
        { letter: "Y", userLetter: "", isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "H", userLetter: "", isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "N", userLetter: "", isBlack: false },
        { letter: "N", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "K", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "C", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "K", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "", userLetter: "", isBlack: true },
        { letter: "C", userLetter: "", number: 4, isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "S", userLetter: "", number: 5, isBlack: false },
        { letter: "Q", userLetter: "", isBlack: false },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "C", userLetter: "", number: 6, isBlack: false },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "M", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "H", userLetter: "", number: 7, isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "H", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "C", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "H", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "J", userLetter: "", number: 8, isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "N", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
    ],
    clues: [
      { number: 1, text: "Coffee programming language", row: 0, col: 0, direction: "across", length: 4 },
      { number: 1, text: "Unused code", row: 0, col: 0, direction: "down", length: 4 },
      { number: 2, text: "Markup language", row: 0, col: 5, direction: "across", length: 4 },
      { number: 2, text: "Link tag", row: 0, col: 5, direction: "down", length: 4 },
      { number: 3, text: "Snake programming language", row: 2, col: 2, direction: "across", length: 7 },
      { number: 3, text: "Execute a program", row: 2, col: 2, direction: "down", length: 4 },
      { number: 4, text: "Styling language", row: 4, col: 1, direction: "across", length: 3 },
      { number: 5, text: "Database query language", row: 4, col: 6, direction: "across", length: 3 },
      { number: 6, text: "Object blueprint", row: 5, col: 0, direction: "across", length: 5 },
      { number: 6, text: "Storage space", row: 5, col: 0, direction: "down", length: 5 },
      { number: 7, text: "Data lookup structure", row: 6, col: 4, direction: "across", length: 4 },
      { number: 8, text: "Data interchange format", row: 8, col: 5, direction: "across", length: 4 },
    ],
  },
  // Puzzle 3
  {
    grid: [
      [
        { letter: "F", userLetter: "", number: 1, isBlack: false },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "G", userLetter: "", number: 2, isBlack: false },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "N", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "G", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", number: 3, isBlack: false },
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "C", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "", userLetter: "", isBlack: true },
        { letter: "S", userLetter: "", number: 4, isBlack: false },
        { letter: "C", userLetter: "", isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "C", userLetter: "", number: 5, isBlack: false },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "D", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "P", userLetter: "", number: 6, isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
      ],
      [
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "D", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", number: 7, isBlack: false },
      ],
      [
        { letter: "M", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "R", userLetter: "", number: 8, isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "M", userLetter: "", isBlack: false },
      ],
      [
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "S", userLetter: "", number: 9, isBlack: false },
        { letter: "H", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
    ],
    clues: [
      { number: 1, text: "Document on disk", row: 0, col: 0, direction: "across", length: 4 },
      { number: 1, text: "Procedure or method", row: 0, col: 0, direction: "down", length: 8 },
      { number: 2, text: "Version control system", row: 0, col: 5, direction: "across", length: 3 },
      { number: 2, text: "Network switch device", row: 0, col: 5, direction: "down", length: 4 },
      { number: 3, text: "Web service interface", row: 2, col: 4, direction: "across", length: 4 },
      { number: 4, text: "Code to automate tasks", row: 4, col: 1, direction: "across", length: 6 },
      { number: 5, text: "Internet hosting service", row: 5, col: 0, direction: "across", length: 5 },
      { number: 5, text: "Write code", row: 5, col: 0, direction: "down", length: 4 },
      { number: 6, text: "USB connector", row: 5, col: 7, direction: "across", length: 3 },
      { number: 6, text: "Wiring connection", row: 5, col: 7, direction: "down", length: 4 },
      { number: 7, text: "Memory storage", row: 6, col: 9, direction: "down", length: 2 },
      { number: 8, text: "Admin access level", row: 7, col: 5, direction: "across", length: 5 },
      { number: 9, text: "Command line interface", row: 8, col: 3, direction: "across", length: 5 },
    ],
  },
  // Puzzle 4
  {
    grid: [
      [
        { letter: "S", userLetter: "", number: 1, isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "V", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "P", userLetter: "", number: 2, isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "C", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "C", userLetter: "", number: 3, isBlack: false },
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "U", userLetter: "", isBlack: false },
      ],
      [
        { letter: "K", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "K", userLetter: "", number: 4, isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "N", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "", userLetter: "", isBlack: true },
        { letter: "C", userLetter: "", number: 5, isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "C", userLetter: "", isBlack: false },
        { letter: "H", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "B", userLetter: "", number: 6, isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "C", userLetter: "", isBlack: false },
        { letter: "H", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "U", userLetter: "", number: 7, isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "G", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "I", userLetter: "", number: 8, isBlack: false },
        { letter: "N", userLetter: "", isBlack: false },
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "U", userLetter: "", isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "D", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
    ],
    clues: [
      { number: 1, text: "Hosts applications", row: 0, col: 0, direction: "across", length: 6 },
      { number: 1, text: "Organized layers", row: 0, col: 0, direction: "down", length: 5 },
      { number: 2, text: "Network socket number", row: 2, col: 4, direction: "across", length: 4 },
      { number: 2, text: "Data packet", row: 2, col: 4, direction: "down", length: 4 },
      { number: 3, text: "Central processor", row: 3, col: 7, direction: "across", length: 3 },
      { number: 4, text: "OS core", row: 4, col: 3, direction: "across", length: 6 },
      { number: 5, text: "Temporary storage", row: 5, col: 1, direction: "across", length: 5 },
      { number: 6, text: "Group of files", row: 6, col: 0, direction: "across", length: 5 },
      { number: 6, text: "Software glitch", row: 6, col: 0, direction: "down", length: 3 },
      { number: 7, text: "Web address", row: 7, col: 6, direction: "across", length: 3 },
      { number: 8, text: "Data entered", row: 8, col: 2, direction: "across", length: 5 },
      { number: 8, text: "Identifier number", row: 8, col: 2, direction: "down", length: 2 },
    ],
  },
  // Puzzle 5
  {
    grid: [
      [
        { letter: "N", userLetter: "", number: 1, isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "D", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", number: 2, isBlack: false },
        { letter: "J", userLetter: "", isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "X", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "L", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "M", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "R", userLetter: "", number: 3, isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "C", userLetter: "", isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "S", userLetter: "", number: 4, isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "T", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", number: 5, isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "Y", userLetter: "", isBlack: false },
        { letter: "N", userLetter: "", isBlack: false },
        { letter: "C", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "P", userLetter: "", number: 6, isBlack: false },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "I", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "A", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "D", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "C", userLetter: "", number: 7, isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "R", userLetter: "", isBlack: false },
        { letter: "E", userLetter: "", isBlack: false },
      ],
      [
        { letter: "P", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "M", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "E", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "H", userLetter: "", number: 8, isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "O", userLetter: "", isBlack: false },
        { letter: "K", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
      [
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "S", userLetter: "", isBlack: false },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
        { letter: "", userLetter: "", isBlack: true },
      ],
    ],
    clues: [
      { number: 1, text: "JavaScript runtime", row: 0, col: 0, direction: "across", length: 4 },
      { number: 1, text: "Stack layer", row: 0, col: 0, direction: "down", length: 4 },
      { number: 2, text: "Asynchronous web tech", row: 0, col: 5, direction: "across", length: 4 },
      { number: 2, text: "Method parameter", row: 0, col: 5, direction: "down", length: 3 },
      { number: 3, text: "Facebook library", row: 2, col: 4, direction: "across", length: 5 },
      { number: 3, text: "Random memory", row: 2, col: 4, direction: "down", length: 3 },
      { number: 4, text: "Component condition", row: 3, col: 3, direction: "across", length: 5 },
      { number: 5, text: "Non-blocking code", row: 4, col: 1, direction: "across", length: 5 },
      { number: 6, text: "Analyze syntax", row: 5, col: 0, direction: "across", length: 5 },
      { number: 6, text: "Communication line", row: 5, col: 0, direction: "down", length: 4 },
      { number: 7, text: "Processor component", row: 6, col: 6, direction: "across", length: 4 },
      { number: 8, text: "React function", row: 8, col: 3, direction: "across", length: 4 },
    ],
  },
];

export default function CrosswordGame() {
  const [currentPuzzleIndex] = useState(() => Math.floor(Math.random() * PUZZLES.length));
  const [grid, setGrid] = useState<Cell[][]>(() => {
    const puzzle = PUZZLES[currentPuzzleIndex];
    return puzzle.grid.map((row) => row.map((cell) => ({ ...cell, userLetter: "" })));
  });
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [won, setWon] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(null);

  const puzzle = PUZZLES[currentPuzzleIndex];
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Load personal best
  useEffect(() => {
    const saved = localStorage.getItem("pb-crossword");
    if (saved) {
      setPersonalBest(parseInt(saved, 10));
    }
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning || won) return;

    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, won]);

  // Check for completion
  useEffect(() => {
    if (won) return;

    let allCorrect = true;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (grid[r][c].isBlack) continue;
        if (grid[r][c].userLetter !== grid[r][c].letter) {
          allCorrect = false;
          break;
        }
      }
      if (!allCorrect) break;
    }

    if (allCorrect) {
      setWon(true);
      setIsRunning(false);

      const currentBest = localStorage.getItem("pb-crossword");
      if (!currentBest || timer < parseInt(currentBest)) {
        localStorage.setItem("pb-crossword", timer.toString());
        setPersonalBest(timer);
      }
    }
  }, [grid, won, timer]);

  const getCurrentClue = useCallback(() => {
    if (!selectedCell) return null;
    const [row, col] = selectedCell;

    // Find the clue for the current word
    const clue = puzzle.clues.find((c) => {
      if (c.direction !== direction) return false;
      if (direction === "across") {
        return c.row === row && col >= c.col && col < c.col + c.length;
      } else {
        return c.col === col && row >= c.row && row < c.row + c.length;
      }
    });

    return clue;
  }, [selectedCell, direction, puzzle.clues]);

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isBlack || won) return;

    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      setDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setSelectedCell([row, col]);
    }

    // Focus hidden input to open mobile keyboard
    setTimeout(() => hiddenInputRef.current?.focus(), 50);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedCell || won) return;

      const [row, col] = selectedCell;
      const key = e.key.toUpperCase();

      if (key.length === 1 && key >= "A" && key <= "Z") {
        e.preventDefault();
        const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
        newGrid[row][col].userLetter = key;
        setGrid(newGrid);

        // Move to next cell in current direction
        const clue = getCurrentClue();
        if (clue) {
          let nextRow = row;
          let nextCol = col;

          if (direction === "across") {
            nextCol++;
            if (nextCol < clue.col + clue.length && !grid[nextRow][nextCol]?.isBlack) {
              setSelectedCell([nextRow, nextCol]);
            }
          } else {
            nextRow++;
            if (nextRow < clue.row + clue.length && !grid[nextRow][nextCol]?.isBlack) {
              setSelectedCell([nextRow, nextCol]);
            }
          }
        }
      } else if (key === "BACKSPACE" || key === "DELETE") {
        e.preventDefault();
        const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
        newGrid[row][col].userLetter = "";
        setGrid(newGrid);

        // Move to previous cell if current was empty
        if (grid[row][col].userLetter === "" && key === "BACKSPACE") {
          const clue = getCurrentClue();
          if (clue) {
            let prevRow = row;
            let prevCol = col;

            if (direction === "across") {
              prevCol--;
              if (prevCol >= clue.col && !grid[prevRow][prevCol]?.isBlack) {
                setSelectedCell([prevRow, prevCol]);
              }
            } else {
              prevRow--;
              if (prevRow >= clue.row && !grid[prevRow][prevCol]?.isBlack) {
                setSelectedCell([prevRow, prevCol]);
              }
            }
          }
        }
      } else if (key === "ARROWUP" || key === "ARROWDOWN" || key === "ARROWLEFT" || key === "ARROWRIGHT") {
        e.preventDefault();
        let newRow = row;
        let newCol = col;

        switch (key) {
          case "ARROWUP":
            newRow = Math.max(0, row - 1);
            while (newRow >= 0 && grid[newRow][col].isBlack) newRow--;
            break;
          case "ARROWDOWN":
            newRow = Math.min(9, row + 1);
            while (newRow <= 9 && grid[newRow][col].isBlack) newRow++;
            break;
          case "ARROWLEFT":
            newCol = Math.max(0, col - 1);
            while (newCol >= 0 && grid[row][newCol].isBlack) newCol--;
            break;
          case "ARROWRIGHT":
            newCol = Math.min(9, col + 1);
            while (newCol <= 9 && grid[row][newCol].isBlack) newCol++;
            break;
        }

        if (newRow >= 0 && newRow <= 9 && newCol >= 0 && newCol <= 9 && !grid[newRow][newCol].isBlack) {
          setSelectedCell([newRow, newCol]);
          if (key === "ARROWUP" || key === "ARROWDOWN") setDirection("down");
          else setDirection("across");
        }
      }
    },
    [selectedCell, grid, won, direction, getCurrentClue]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Handle mobile keyboard input via hidden input
  const handleMobileInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value.toUpperCase();
    (e.target as HTMLInputElement).value = "";

    if (!selectedCell || won) return;
    const [row, col] = selectedCell;

    const lastChar = value.slice(-1);
    if (lastChar >= "A" && lastChar <= "Z") {
      const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[row][col].userLetter = lastChar;
      setGrid(newGrid);

      const clue = getCurrentClue();
      if (clue) {
        if (direction === "across") {
          const nextCol = col + 1;
          if (nextCol < clue.col + clue.length && !grid[row][nextCol]?.isBlack) {
            setSelectedCell([row, nextCol]);
          }
        } else {
          const nextRow = row + 1;
          if (nextRow < clue.row + clue.length && !grid[nextRow]?.[col]?.isBlack) {
            setSelectedCell([nextRow, col]);
          }
        }
      }
    }
  };

  const handleCheck = () => {
    setShowErrors(true);
    setTimeout(() => setShowErrors(false), 2000);
  };

  const handleShare = async () => {
    const timeStr = formatTime(timer);
    const text = `I completed a crossword puzzle in ${timeStr}! Can you beat my time? Play at playmini.fun/crossword`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  const newGame = () => {
    window.location.reload();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentClue = getCurrentClue();
  const acrossClues = puzzle.clues.filter((c) => c.direction === "across");
  const downClues = puzzle.clues.filter((c) => c.direction === "down");

  const getHighlightedCells = (): Set<string> => {
    const cells = new Set<string>();
    if (!selectedCell || !currentClue) return cells;

    if (currentClue.direction === "across") {
      for (let c = currentClue.col; c < currentClue.col + currentClue.length; c++) {
        cells.add(`${currentClue.row}-${c}`);
      }
    } else {
      for (let r = currentClue.row; r < currentClue.row + currentClue.length; r++) {
        cells.add(`${r}-${currentClue.col}`);
      }
    }

    return cells;
  };

  const highlightedCells = getHighlightedCells();

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-4xl">
        <div className="text-2xl font-mono font-bold text-white">{formatTime(timer)}</div>

        {personalBest !== null && !won && (
          <div className="text-slate-400 text-sm">Personal Best: {formatTime(personalBest)}</div>
        )}

        <div className="flex gap-2 sm:ml-auto">
          <button
            onClick={handleCheck}
            disabled={won}
            className="px-4 py-2 rounded font-medium bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Check
          </button>
          <button
            onClick={newGame}
            className="px-4 py-2 rounded font-medium bg-green-700 hover:bg-green-600 text-white transition"
          >
            New Puzzle
          </button>
        </div>
      </div>

      {/* Current Clue */}
      {currentClue && !won && (
        <div className="bg-slate-800 rounded-lg p-4 w-full max-w-4xl border border-slate-700">
          <div className="text-slate-400 text-sm font-medium mb-1">
            {currentClue.number} {direction === "across" ? "Across" : "Down"}
          </div>
          <div className="text-white text-lg">{currentClue.text}</div>
        </div>
      )}

      {/* Win Message */}
      {won && (
        <div className="bg-green-900/50 border border-green-600 rounded-lg p-6 text-center w-full max-w-4xl">
          <div className="text-3xl font-bold text-green-400 mb-3">Puzzle Complete!</div>
          <div className="text-slate-300 text-xl mb-4">
            Time: {formatTime(timer)}
            {personalBest === timer && <span className="ml-2 text-yellow-400 font-bold">New Best!</span>}
          </div>
          <button
            onClick={handleShare}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition text-lg"
          >
            Share Result
          </button>
        </div>
      )}

      {/* Hidden input for mobile keyboard */}
      <input
        ref={hiddenInputRef}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        className="sr-only"
        onInput={handleMobileInput}
        onKeyDown={(e) => {
          if (e.key === "Backspace") {
            e.preventDefault();
            handleKeyDown(e.nativeEvent);
          }
        }}
      />

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
        {/* Grid */}
        <div className="flex-shrink-0">
          <div className="bg-slate-800 p-2 sm:p-4 rounded-lg inline-block">
            <div className="grid grid-cols-10 gap-0" style={{ width: "min(90vw, 500px)" }}>
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                  const isHighlighted = highlightedCells.has(`${r}-${c}`);
                  const isError = showErrors && cell.userLetter && cell.userLetter !== cell.letter;
                  const isCorrect = showErrors && cell.userLetter && cell.userLetter === cell.letter;

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      disabled={cell.isBlack || won}
                      className={`
                        aspect-square flex items-center justify-center text-lg sm:text-xl font-bold
                        border border-slate-600 relative transition
                        ${cell.isBlack ? "bg-slate-950" : ""}
                        ${!cell.isBlack && isSelected ? "bg-blue-600 text-white" : ""}
                        ${!cell.isBlack && isHighlighted && !isSelected ? "bg-slate-700" : ""}
                        ${!cell.isBlack && !isHighlighted && !isSelected ? "bg-white text-slate-900" : ""}
                        ${!cell.isBlack && !isSelected && !isHighlighted && cell.userLetter ? "text-slate-900" : ""}
                        ${isError ? "bg-red-500/70 text-white" : ""}
                        ${isCorrect ? "bg-green-500/70 text-white" : ""}
                        ${!cell.isBlack ? "hover:bg-slate-300" : ""}
                      `}
                    >
                      {!cell.isBlack && (
                        <>
                          {cell.number && (
                            <span className="absolute top-0 left-0 text-[8px] sm:text-[10px] text-slate-600 font-normal m-0.5">
                              {cell.number}
                            </span>
                          )}
                          <span className="uppercase">{cell.userLetter}</span>
                        </>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Clues */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Across */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 h-fit max-h-[500px] overflow-y-auto">
            <h3 className="text-white font-bold text-lg mb-3">Across</h3>
            <div className="space-y-2">
              {acrossClues.map((clue) => {
                const isActive = currentClue?.number === clue.number && direction === "across";
                return (
                  <div
                    key={`across-${clue.number}`}
                    className={`text-sm ${
                      isActive ? "text-blue-400 font-semibold" : "text-slate-300"
                    }`}
                  >
                    <span className="font-bold">{clue.number}.</span> {clue.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Down */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 h-fit max-h-[500px] overflow-y-auto">
            <h3 className="text-white font-bold text-lg mb-3">Down</h3>
            <div className="space-y-2">
              {downClues.map((clue) => {
                const isActive = currentClue?.number === clue.number && direction === "down";
                return (
                  <div
                    key={`down-${clue.number}`}
                    className={`text-sm ${
                      isActive ? "text-blue-400 font-semibold" : "text-slate-300"
                    }`}
                  >
                    <span className="font-bold">{clue.number}.</span> {clue.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-slate-500 text-sm max-w-2xl">
        <p>Click a cell to select it. Type to fill in letters. Click again to toggle direction.</p>
        <p className="mt-1">Use arrow keys to navigate. Backspace to erase.</p>
      </div>
    </div>
  );
}
