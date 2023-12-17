import type OpenAI from "openai";

export const getPickGeoFieldPrompt = (
  sampleData: unknown
): Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> => {
  return [
    {
      role: "system",
      content: `너는 다음에 주어지는 입력에서 위치 정보에 해당하는 프로퍼티 이름을 추출해주는 전문가 역할이야. 주어지는 입력은 JSON 형태야. 아래의 순서로 위치 정보에 해당하는 필드를 골라야 해.
1. 좌표계는 WGS84가 아닐수도 있다는 점에 유의해 적절한 위도와 경도 필드 이름을 고른다. 필드 명은 X, Y 등일 수 있다는 점을 참고한다. 다음과 같은 형태로 출력한다: LATITUDE_FIELD_NAME_HERE, LONGITUDE_FIELD_NAME_HERE
2. 좌표 정보가 없다면, 주소 정보를 추출한다. 도로명 주소를 우선하도록 한다. 다음과 같은 형태로 출력한다: ADDRESS_FIELD_NAME_HERE
반드시 주소보다 좌표 추출을 우선해야 해. 설명 없이 추출된 필드명만을 출력해야 해.`,
    },
    {
      role: "user",
      content: `입력은 다음과 같아. 입력: ${JSON.stringify(
        sampleData
      )}
위치정보: `,
    },
  ];
};

export const getPickImportantFieldNamesPrompt = ({
  serviceName,
  sampleData,
}: {
  serviceName?: string;
  sampleData: unknown;
}): Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> => {
  return [
    {
      role: "system",
      content: `너는 다음에 주어지는 ${
        serviceName ? `${serviceName}에 대한 ` : ""
      }입력에서 중요한 정보를 담고 있는 프로퍼티 이름을 추출해주는 전문가 역할이야. 주어지는 입력은 JSON 형태야.
아래의 조건에 맞는 프로퍼티 이름을 잘 골라야 해.
* 데이터의 중요도 순으로 프로퍼티 이름의 순서를 정한다.
* 좌표, 주소 등의 위치 정보, 이미지 정보는 제외한다.
* 중요한 정보가 없다면, 빈 배열을 출력한다.
* 일반인이 보기에 ${
        serviceName
          ? `${serviceName}에 대해 파악하기에 `
          : ""
      }의미를 가지지 않는 프로퍼티는 제외한다. 예를 들어, id, code, 마지막 수정일 등은 제외한다.
설명 없이 추출된 필드명만을 배열 형태로 출력해야 해.
잘 고르면 팁을 100달러 줄게.`,
    },
    {
      role: "user",
      content: `입력은 다음과 같아. 입력: ${JSON.stringify(
        sampleData
      )}
프로퍼티 이름: `,
    },
  ];
};
