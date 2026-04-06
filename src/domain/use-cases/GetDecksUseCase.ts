import { DeckRepository } from "../../infrastructure/repositories/DeckRepository";
import { Deck } from "../entities/Deck";

export class GetDecksUseCase {
  constructor(private deckRepository: DeckRepository) {}

  async execute(): Promise<Deck[]> {
    return await this.deckRepository.getAllDecks();
  }
}
