DROP DATABASE IF EXISTS tweettones;
CREATE DATABASE tweettones;

\c tweettones;

CREATE TABLE tweettones (
  id VARCHAR NOT NULL PRIMARY KEY,
  timestamp VARCHAR,
  body VARCHAR,
  emotion_tone VARCHAR,
  language_tone VARCHAR,
  social_tone VARCHAR
);

INSERT INTO tweettones(id, timestamp, body, emotion_tone, language_tone, social_tone)
  VALUES(
    '876558049565188096',
    '2017-06-18T21:51:39.000Z',
    'Camp David is a very special place. An honor to have spent the weekend there. Military runs it so well and are so proud of what they do!',
    '{"anger":0.013479,"disgust":0.014383,"fear":0.076519,"joy":0.848637,"sadness":0.053553}',
    '{"analytical": 0, "confident": 0.890603, "tentative": 0}',
    '{"openness": 0.147704, "conscientiousness": 0.824005, "extraversion": 0.49908,"agreeableness": 0.919033,"emotional range": 0.716641}'
  );
