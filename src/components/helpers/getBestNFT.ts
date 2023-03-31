import dataRanked from "../../data/PengSol_ranks.json";
import dataKing from "../../data/PengSol_king.json";


export function getBestNFt(mints:string[]){

    const bestNFT = mints.reduce(
        (prev, curr) => {
          const found = dataRanked.find((element) => element.address === curr);
          if (found) {
            if (prev.rank === 0) {
              return found;
            }
            const foundInKing = dataKing.find(
              (kingPeng) => kingPeng === prev.name
            );
            if (foundInKing) {
              return prev;
            }
            if (
              dataKing.find((kingPeng) => kingPeng === found.name) ||
              (!foundInKing && prev.rank !== 0 && prev.rank > found.rank)
            ) {
              return found;
            }
          }
          return prev;
        },
        {
          rank: 0,
          name: "",
          address: "",
          tier: "",
        }
      );

    return bestNFT
}