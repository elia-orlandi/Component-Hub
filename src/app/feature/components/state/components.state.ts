import { Component } from "../../../core/models/database.type";

export type ComponentsState = {
  components: Component[];
  selectedComponent: Component | null;
  isLoading: boolean;
  error: string | null;
};

export const initialState: ComponentsState = {
  components: [],
  selectedComponent: null,
  isLoading: false,
  error: null,
};